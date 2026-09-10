import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { MaintenanceRecord, InspectionHistory } from "@/types";

const HISTORY_COLLECTION = "maintenance_history";

export class HistoryService {
  // Query all maintenance audits for a specific location
  static async getHistoryByLocation(locationId: string): Promise<InspectionHistory> {
    try {
      const q = query(
        collection(db, HISTORY_COLLECTION),
        where("locationId", "==", locationId),
        orderBy("inspectionDate", "desc")
      );

      const snapshot = await getDocs(q);
      const records: MaintenanceRecord[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MaintenanceRecord[];

      const latestRecord = records[0];
      const currentStatus = latestRecord
        ? latestRecord.severityScore > 70
          ? "critical"
          : latestRecord.severityScore > 40
          ? "needs-attention"
          : "healthy"
        : "healthy";

      return {
        locationId,
        locationName: latestRecord?.locationName || "Monitored Location",
        totalInspections: records.length,
        records,
        currentStatus,
        lastInspectionDate: latestRecord?.inspectionDate || "None",
        nextInspectionDue: this.calculateNextInspection(latestRecord),
      };
    } catch (error) {
      console.error("Error retrieving historical audits:", error);
      return this.getDemoHistory(locationId);
    }
  }

  // Record a new structural inspection
  static async addInspectionRecord(
    record: Omit<MaintenanceRecord, "id" | "createdAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, HISTORY_COLLECTION), {
        ...record,
        createdAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error logging inspection record:", error);
      throw error;
    }
  }

  // Structured fallback demo data for Vignan campus & surrounding areas
  static getDemoHistory(locationId: string): InspectionHistory {
    return {
      locationId,
      locationName: "Vignan University Main Road",
      totalInspections: 4,
      records: [
        {
          id: "AUD-2026-004",
          locationId,
          locationName: "Vignan University Main Road",
          inspectionDate: "2026-02-12",
          inspectorName: "Er. Ramesh Kumar (PWD)",
          defectType: "road",
          severity: "critical",
          severityScore: 89,
          description: "Deep structural shear crack across main road entrance lane.",
          actionTaken: "inspected",
          repairCost: 145000,
          createdAt: "2026-02-12T10:00:00Z",
        },
        {
          id: "AUD-2025-089",
          locationId,
          locationName: "Vignan University Main Road",
          inspectionDate: "2025-11-05",
          inspectorName: "InfraShield Patrol Node 2",
          defectType: "road",
          severity: "high",
          severityScore: 68,
          description: "Monsoon erosion leading to progressive pothole clustering near Gate 2.",
          actionTaken: "repaired",
          repairCost: 55000,
          createdAt: "2025-11-05T10:00:00Z",
        },
        {
          id: "AUD-2025-042",
          locationId,
          locationName: "Vignan University Main Road",
          inspectionDate: "2025-06-18",
          inspectorName: "Er. Priya Sharma (Vignan Estates)",
          defectType: "drainage",
          severity: "medium",
          severityScore: 42,
          description: "Silt blockage in storm-water drain causing localized road waterlogging.",
          actionTaken: "repaired",
          repairCost: 12000,
          createdAt: "2025-06-18T10:00:00Z",
        },
        {
          id: "AUD-2025-001",
          locationId,
          locationName: "Vignan University Main Road",
          inspectionDate: "2025-01-10",
          inspectorName: "InfraShield Patrol Node 1",
          defectType: "road",
          severity: "low",
          severityScore: 21,
          description: "Routine baseline audit — surface bitumen wear on main avenue.",
          actionTaken: "inspected",
          repairCost: 5000,
          createdAt: "2025-01-10T10:00:00Z",
        },
      ],
      currentStatus: "critical",
      lastInspectionDate: "2026-02-12",
      nextInspectionDue: "2026-03-12",
    };
  }

  private static calculateNextInspection(latestRecord?: MaintenanceRecord): string {
    if (!latestRecord) return "N/A";
    const date = new Date(latestRecord.inspectionDate);
    const monthsToAdd = latestRecord.severityScore > 70 ? 1 : latestRecord.severityScore > 40 ? 3 : 6;
    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toISOString().split("T")[0];
  }
}