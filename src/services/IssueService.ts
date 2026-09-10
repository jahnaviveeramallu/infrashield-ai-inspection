// src/services/IssueService.ts
import { evaluatePriority, calculatePriority } from '../lib/agents/PriorityAgent';
import { getCollection, dateToTimestamp, timestampToDate } from '../lib/firebase/helpers';
import { COLLECTION_NAMES, ISSUE_STATUS } from '../constants';
import { Issue, Location } from '../types';
import { GeminiService } from '../lib/gemini/service';
import { VisionAgent } from '../lib/agents/VisionAgent';
import { ContextAgent } from '../lib/agents/ContextAgent';
import { PriorityAgent } from '../lib/agents/PriorityAgent';
import { RecommendationAgent } from '../lib/agents/RecommendationAgent';
import { ExecutiveSummaryAgent } from '../lib/agents/ExecutiveSummaryAgent';
import { DuplicateDetectionAgent } from '../lib/agents/DuplicateDetectionAgent';

// Mock Communications Agent for parsing
const CommunicationsAgent = {
  process: (rawJson: any) => ({
    tweetDraft: rawJson.communications?.tweetDraft || "Issue reported in your area. Teams are investigating.",
    emailDraft: rawJson.communications?.emailDraft || "Please dispatch a team to the reported location."
  })
};

export class IssueService {
  private static collection = getCollection(COLLECTION_NAMES.ISSUES);

  private static mapToIssue(docId: string, data: any): Issue {
    return {
      id: docId,
      imageUrl: data.imageUrl,
      location: data.location,
      status: data.status,
      upvotes: data.upvotes || 0,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      vision: data.vision,
      context: data.context,
      priority: data.priority,
      recommendation: data.recommendation,
      executiveSummary: data.executiveSummary,
      duplicateDetection: data.duplicateDetection,
      communications: data.communications,
    } as Issue;
  }

  static async createIssue(issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Issue> {
    const now = new Date();
    
    const issueToCreate = {
      ...issueData,
      upvotes: issueData.upvotes || 0,
      createdAt: dateToTimestamp(now),
      updatedAt: dateToTimestamp(now),
    };

    const docRef = await this.collection.add(issueToCreate);

    return {
      id: docRef.id,
      ...issueData,
      upvotes: issueToCreate.upvotes,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async getIssue(id: string): Promise<Issue | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (!data) return null;

    return this.mapToIssue(doc.id, data);
  }

  static async getAllIssues(): Promise<Issue[]> {
    const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
    // ✅ Fixed: Explicitly typed doc parameter as any to satisfy TypeScript strict mode
    return snapshot.docs.map((doc: any) => this.mapToIssue(doc.id, doc.data()));
  }

  static async updateIssue(id: string, updateData: Partial<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = this.collection.doc(id);
    await docRef.update({
      ...updateData,
      updatedAt: dateToTimestamp(new Date()),
    });
  }

  static async deleteIssue(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  static async analyzeIssue(imageUrl: string, base64Image: string, mimeType: string, location: Location): Promise<Issue> {
    const geminiRaw = await GeminiService.analyzeImage(base64Image, mimeType);
    
    const vision = VisionAgent.process(geminiRaw);
    const context = ContextAgent.process(geminiRaw);
    const priority = PriorityAgent.process(geminiRaw, 0);
    const recommendation = RecommendationAgent.process(geminiRaw);
    const executiveSummary = ExecutiveSummaryAgent.process(geminiRaw);
    const communications = CommunicationsAgent.process(geminiRaw);
    
    const duplicateDetection = await this.checkDuplicateIssues(location, vision.issueType || 'General');

    const newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'> = {
      imageUrl,
      location,
      status: ISSUE_STATUS.AI_ANALYSED as Issue['status'],
      upvotes: 0,
      vision,
      context,
      priority,
      recommendation,
      executiveSummary,
      duplicateDetection,
      communications
    };

    return this.createIssue(newIssueData);
  }

  static async checkDuplicateIssues(location: Location, issueType: string) {
    const allIssues = await this.getAllIssues();
    return DuplicateDetectionAgent.process(location, issueType, allIssues);
  }

  static async updateIssueStatus(id: string, status: Issue['status']): Promise<void> {
    await this.updateIssue(id, { status });
  }

  static async updatePriority(id: string, newScore: number): Promise<void> {
    const docRef = this.collection.doc(id);
    await docRef.update({
      'priority.score': newScore,
      updatedAt: dateToTimestamp(new Date()),
    });
  }

  static async upvoteIssue(id: string): Promise<void> {
    const issue = await this.getIssue(id);
    if (!issue) throw new Error('Issue not found');
    
    const newUpvotes = issue.upvotes + 1;
    const newScore = Math.min(100, issue.priority.score + 1); 
    
    const docRef = this.collection.doc(id);
    await docRef.update({
      upvotes: newUpvotes,
      'priority.score': newScore,
      updatedAt: dateToTimestamp(new Date()),
    });
  }
}