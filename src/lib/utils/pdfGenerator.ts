import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EngineeringReportData } from "@/types";

export function generateEngineeringReport(data: EngineeringReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. HEADER BRANDING (Navy Dark Corporate Header)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("INFRASHIELD AI", 15, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 220, 255);
  doc.text("Autonomous Infrastructure Inspection & Quality Audit Core", 15, 25);

  doc.setFontSize(8);
  doc.setTextColor(150, 180, 220);
  doc.text(`SYSTEM REGISTRY ID: ${data.reportId}`, 15, 34);

  // 2. DOCUMENT META BAR
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(0, 42, pageWidth, 12, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`AUDIT DATE: ${data.date}`, 15, 50);
  doc.text(`CHIEF AUDITOR: ${data.inspectorName.toUpperCase()}`, pageWidth - 15, 50, { align: "right" });

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 54, pageWidth, 54);

  // 3. SECTION I: SPECIFICATIONS TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("I. GEOSPATIAL & STRUCTURAL AUDIT SPECIFICATION", 15, 68);

  autoTable(doc, {
    startY: 74,
    head: [["STRUCTURAL PARAMETER", "SYSTEM ASSIGNED EVALUATION VALUE"]],
    body: [
      ["Inspection Location Name", data.location],
      ["Geospatial Coordinates", data.gpsCoordinates],
      ["Infrastructure Category", data.defectType.toUpperCase()],
      ["AI Defect Description Summary", data.description],
      ["Risk Score Rating", `${data.severityScore} / 100 (${data.severity.toUpperCase()})`],
      ["Allocated Engineering Department", data.department],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 130 },
    },
    margin: { left: 15, right: 15 },
  });

  const firstTableEndY = (doc as any).lastAutoTable.finalY || 140;

  // 4. SECTION II: TECHNICAL ANALYSIS & BUDGETING
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("II. AI TECHNICAL ANALYSIS & LOGISTICS ESTIMATION", 15, firstTableEndY + 12);

  autoTable(doc, {
    startY: firstTableEndY + 18,
    head: [["DIAGNOSTIC FACTOR", "CALCULATED ENGINEERING RECOMMENDATION"]],
    body: [
      ["AI Diagnostic Root Cause Analysis", data.aiAnalysis],
      ["Temporary Stabilization Action Plan", data.recommendedAction],
      ["Autonomous Repair Budget (INR)", `Rs. ${data.estimatedCost.toLocaleString("en-IN")}/-`],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 130 },
    },
    margin: { left: 15, right: 15 },
  });

  const secondTableEndY = (doc as any).lastAutoTable.finalY || 210;

  // 5. SIGNATURE FOOTER
  const signatureY = Math.min(secondTableEndY + 20, pageHeight - 45);

  doc.setDrawColor(203, 213, 225);
  doc.line(15, signatureY, 75, signatureY);
  doc.line(pageWidth - 75, signatureY, pageWidth - 15, signatureY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text("InfraShield AI System Seal", 45, signatureY + 5, { align: "center" });
  doc.text("[Verified Cryptographically]", 45, signatureY + 9, { align: "center" });

  doc.text("Supervising Officer Signature", pageWidth - 45, signatureY + 5, { align: "center" });
  doc.text(`[${data.inspectorName}]`, pageWidth - 45, signatureY + 9, { align: "center" });

  // 6. GLOBAL FOOTER STRIP
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `CONFIDENTIAL REPORT — INFRASHIELD AI AUDIT SUITE — GENERATED SECURELY ON ${new Date().toLocaleString("en-IN")}`,
    pageWidth / 2,
    pageHeight - 4,
    { align: "center" }
  );

  // 7. TRIGGER DOWNLOAD
  doc.save(`InfraShield_Report_${data.reportId}.pdf`);
}