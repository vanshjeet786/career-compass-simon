import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface AssessmentData {
  intelligenceScores: Record<string, number>;
  personalityInsights: Record<string, number>;
  careerRecommendations: Array<{
    title: string;
    description: string;
    matchPercentage: number;
  }>;
}

export const generatePDFReport = (data: AssessmentData): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Career Assessment Report', margin, yPosition);
  
  // Date
  pdf.setFontSize(12);
  pdf.setTextColor(102, 102, 102);
  yPosition += 10;
  pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, yPosition);

  yPosition += 25;

  // Executive Summary
  pdf.setFontSize(16);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Executive Summary', margin, yPosition);
  yPosition += 15;

  const topIntelligences = Object.entries(data.intelligenceScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  pdf.setFontSize(11);
  pdf.setTextColor(68, 68, 68);
  const summaryText = `Based on your assessment responses, your top intelligence strengths are ${topIntelligences
    .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1))
    .join(', ')}. This report provides detailed insights into your cognitive strengths and personality traits, along with personalized career recommendations.`;
  
  const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin);
  pdf.text(splitSummary, margin, yPosition);
  yPosition += splitSummary.length * 5 + 15;

  // Intelligence Strengths Section
  pdf.setFontSize(16);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Intelligence Strengths', margin, yPosition);
  yPosition += 10;

  const intelligenceData = Object.entries(data.intelligenceScores)
    .sort(([, a], [, b]) => b - a)
    .map(([type, score]) => [
      type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
      `${score.toFixed(1)}/5.0`,
      getStrengthLevel(score)
    ]);

  pdf.autoTable({
    startY: yPosition,
    head: [['Intelligence Type', 'Score', 'Level']],
    body: intelligenceData,
    theme: 'grid',
    headStyles: { fillColor: [74, 144, 226] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 10 },
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 20;

  // Check if we need a new page
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 30;
  }

  // Personality Insights Section
  pdf.setFontSize(16);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Personality Insights', margin, yPosition);
  yPosition += 10;

  const personalityData = Object.entries(data.personalityInsights)
    .sort(([, a], [, b]) => b - a)
    .map(([trait, score]) => [
      trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1'),
      `${score.toFixed(1)}/5.0`,
      getPersonalityDescription(trait, score)
    ]);

  pdf.autoTable({
    startY: yPosition,
    head: [['Personality Trait', 'Score', 'Description']],
    body: personalityData,
    theme: 'grid',
    headStyles: { fillColor: [139, 195, 74] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 10 },
    columnStyles: {
      2: { cellWidth: 80 }
    }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 20;

  // Check if we need a new page for career recommendations
  if (yPosition > 200) {
    pdf.addPage();
    yPosition = 30;
  }

  // Career Recommendations Section
  pdf.setFontSize(16);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Career Recommendations', margin, yPosition);
  yPosition += 15;

  data.careerRecommendations.slice(0, 5).forEach((career, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(74, 144, 226);
    pdf.text(`${index + 1}. ${career.title} (${career.matchPercentage}% match)`, margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(68, 68, 68);
    const description = pdf.splitTextToSize(career.description, pageWidth - 2 * margin);
    pdf.text(description, margin, yPosition);
    yPosition += description.length * 4 + 6;

    // O*NET reference link
    const onetUrl = `https://www.onetonline.org/find/quick?s=${encodeURIComponent(career.title)}`;
    const onetLine = `O*NET: ${onetUrl}`;
    const wrappedOnet = pdf.splitTextToSize(onetLine, pageWidth - 2 * margin);
    pdf.text(wrappedOnet, margin, yPosition);
    yPosition += wrappedOnet.length * 4 + 10;
  });

  // Footer with action items
  if (yPosition > 230) {
    pdf.addPage();
    yPosition = 30;
  }

  yPosition += 10;
  pdf.setFontSize(16);
  pdf.setTextColor(51, 51, 51);
  pdf.text('Next Steps', margin, yPosition);
  yPosition += 15;

  const nextSteps = [
    'Research the recommended career paths in detail',
    'Connect with professionals in your areas of interest',
    'Develop skills aligned with your intelligence strengths',
    'Consider educational or training opportunities',
    'Update your resume to highlight relevant strengths'
  ];

  pdf.setFontSize(11);
  pdf.setTextColor(68, 68, 68);
  nextSteps.forEach((step, index) => {
    pdf.text(`${index + 1}. ${step}`, margin, yPosition);
    yPosition += 7;
  });

  // Save the PDF
  pdf.save(`career-assessment-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

const getStrengthLevel = (score: number): string => {
  if (score >= 4.5) return 'Exceptional';
  if (score >= 4.0) return 'Strong';
  if (score >= 3.5) return 'Good';
  if (score >= 3.0) return 'Moderate';
  return 'Developing';
};

const getPersonalityDescription = (trait: string, score: number): string => {
  const descriptions = {
    openness: score >= 4 ? 'Highly creative and open to new experiences' : 'Prefers routine and familiar approaches',
    conscientiousness: score >= 4 ? 'Highly organized and goal-oriented' : 'More flexible and spontaneous',
    extraversion: score >= 4 ? 'Energized by social interaction' : 'Prefers quieter, more focused environments',
    agreeableness: score >= 4 ? 'Highly cooperative and trusting' : 'More competitive and skeptical',
    neuroticism: score >= 4 ? 'More sensitive to stress' : 'Emotionally stable and resilient'
  };
  return descriptions[trait as keyof typeof descriptions] || 'Individual trait profile';
};