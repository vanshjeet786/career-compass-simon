import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CareerRecommendations from '@/components/CareerRecommendations';
import { Brain, Target, TrendingUp, Download, Home } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [intelligenceScores, setIntelligenceScores] = useState<Record<string, number>>({});
  const [personalityInsights, setPersonalityInsights] = useState<Record<string, number>>({});
  const [careerRecommendations, setCareerRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const storedResults = localStorage.getItem('assessmentResults');
    if (!storedResults) {
      navigate('/assessment');
      return;
    }

    const data = JSON.parse(storedResults);
    setAssessmentData(data);
    
    // Process the data to extract insights
    processAssessmentData(data);
  }, [navigate]);

  const processAssessmentData = (data: any) => {
    // Process Layer 1 - Multiple Intelligences
    const layer1 = data.layer_1 || {};
    const intelligenceArrays: Record<string, number[]> = {};
    
    // Calculate average scores for each intelligence type
    Object.entries(layer1).forEach(([questionId, score]: [string, any]) => {
      if (typeof score === 'number') {
        const intelligenceType = getIntelligenceType(questionId);
        if (!intelligenceArrays[intelligenceType]) {
          intelligenceArrays[intelligenceType] = [];
        }
        intelligenceArrays[intelligenceType].push(score);
      }
    });

    // Average the scores
    const avgIntelligences: Record<string, number> = {};
    Object.entries(intelligenceArrays).forEach(([type, scores]) => {
      avgIntelligences[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    setIntelligenceScores(avgIntelligences);

    // Process Layer 2 - Personality
    const layer2 = data.layer_2 || {};
    const personalityArrays: Record<string, number[]> = {};
    Object.entries(layer2).forEach(([questionId, score]: [string, any]) => {
      if (typeof score === 'number') {
        const personalityType = getPersonalityType(questionId);
        if (!personalityArrays[personalityType]) {
          personalityArrays[personalityType] = [];
        }
        personalityArrays[personalityType].push(score);
      }
    });

    const avgPersonality: Record<string, number> = {};
    Object.entries(personalityArrays).forEach(([type, scores]) => {
      avgPersonality[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    setPersonalityInsights(avgPersonality);

    // Generate career recommendations based on the analysis
    generateCareerRecommendations(avgIntelligences, avgPersonality);
  };

  const getIntelligenceType = (questionId: string) => {
    if (questionId.includes('linguistic')) return 'Linguistic';
    if (questionId.includes('logical')) return 'Logical-Mathematical';
    if (questionId.includes('interpersonal')) return 'Interpersonal';
    if (questionId.includes('intrapersonal')) return 'Intrapersonal';
    if (questionId.includes('naturalistic')) return 'Naturalistic';
    if (questionId.includes('kinesthetic')) return 'Bodily-Kinesthetic';
    if (questionId.includes('musical')) return 'Musical';
    if (questionId.includes('spatial')) return 'Visual-Spatial';
    return 'General';
  };

  const getPersonalityType = (questionId: string) => {
    if (questionId.includes('mbti')) return 'MBTI';
    if (questionId.includes('openness')) return 'Openness';
    if (questionId.includes('conscientiousness')) return 'Conscientiousness';
    if (questionId.includes('extraversion')) return 'Extraversion';
    if (questionId.includes('agreeableness')) return 'Agreeableness';
    if (questionId.includes('autonomy')) return 'Autonomy';
    if (questionId.includes('competence')) return 'Competence';
    if (questionId.includes('relatedness')) return 'Relatedness';
    return 'General';
  };

  const generateCareerRecommendations = (intelligences: Record<string, number>, personality: Record<string, number>) => {
    // Find top intelligences
    const topIntelligences = Object.entries(intelligences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Career mapping based on top intelligences and personality
    const careerDatabase = [
      {
        title: "Data Scientist",
        category: "Technology",
        description: "Analyze complex data to help organizations make informed decisions using statistical methods and machine learning.",
        requiredSkills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
        salaryRange: "$80,000 - $150,000",
        jobOutlook: "Much faster than average (22% growth)",
        workEnvironment: ["Remote friendly", "Collaborative", "Analytical"],
        matchFactors: ["Logical-Mathematical", "Intrapersonal"],
        matchPercentage: 0
      },
      {
        title: "Software Engineer",
        category: "Technology",
        description: "Design, develop, and maintain software applications and systems using various programming languages.",
        requiredSkills: ["Programming", "Problem Solving", "Algorithms", "Team Collaboration"],
        salaryRange: "$90,000 - $160,000",
        jobOutlook: "Much faster than average (25% growth)",
        workEnvironment: ["Team-based", "Innovative", "Technical"],
        matchFactors: ["Logical-Mathematical", "Intrapersonal"],
        matchPercentage: 0
      },
      {
        title: "UX/UI Designer",
        category: "Creative",
        description: "Create intuitive and visually appealing user interfaces for digital products and services.",
        requiredSkills: ["Design Thinking", "Prototyping", "User Research", "Adobe Creative Suite"],
        salaryRange: "$65,000 - $120,000",
        jobOutlook: "Faster than average (13% growth)",
        workEnvironment: ["Creative", "User-focused", "Collaborative"],
        matchFactors: ["Visual-Spatial", "Interpersonal"],
        matchPercentage: 0
      },
      {
        title: "Content Writer",
        category: "Creative",
        description: "Create engaging written content for various media platforms including websites, blogs, and marketing materials.",
        requiredSkills: ["Writing", "Research", "SEO", "Content Strategy"],
        salaryRange: "$40,000 - $80,000",
        jobOutlook: "Faster than average (9% growth)",
        workEnvironment: ["Independent", "Creative", "Deadline-driven"],
        matchFactors: ["Linguistic", "Intrapersonal"],
        matchPercentage: 0
      },
      {
        title: "Teacher",
        category: "Education",
        description: "Educate and inspire students in various subjects while fostering their intellectual and personal development.",
        requiredSkills: ["Communication", "Curriculum Development", "Classroom Management", "Patience"],
        salaryRange: "$40,000 - $70,000",
        jobOutlook: "As fast as average (8% growth)",
        workEnvironment: ["Social", "Structured", "Nurturing"],
        matchFactors: ["Linguistic", "Interpersonal"],
        matchPercentage: 0
      },
      {
        title: "Environmental Scientist",
        category: "Science",
        description: "Study the environment and find solutions to environmental problems affecting human health and ecosystems.",
        requiredSkills: ["Research", "Data Analysis", "Environmental Monitoring", "Report Writing"],
        salaryRange: "$55,000 - $95,000",
        jobOutlook: "Faster than average (8% growth)",
        workEnvironment: ["Fieldwork", "Laboratory", "Policy-oriented"],
        matchFactors: ["Naturalistic", "Logical-Mathematical"],
        matchPercentage: 0
      }
    ];

    // Calculate match percentages
    const recommendations = careerDatabase.map(career => {
      let matchScore = 0;
      let factorCount = 0;

      career.matchFactors.forEach(factor => {
        if (intelligences[factor]) {
          matchScore += intelligences[factor];
          factorCount++;
        }
      });

      // Add personality bonuses
      if (personality.Openness && career.category === 'Creative') matchScore += personality.Openness * 0.5;
      if (personality.Conscientiousness && career.category === 'Technology') matchScore += personality.Conscientiousness * 0.5;
      if (personality.Extraversion && career.matchFactors.includes('Interpersonal')) matchScore += personality.Extraversion * 0.5;

      const matchPercentage = factorCount > 0 ? Math.min(95, Math.round((matchScore / factorCount) * 20)) : 60;
      
      return {
        ...career,
        matchPercentage
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    setCareerRecommendations(recommendations);
  };

  const getTopIntelligences = () => {
    return Object.entries(intelligenceScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const downloadResults = () => {
    const results = {
      intelligenceScores,
      personalityInsights,
      careerRecommendations,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'career_assessment_results.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!assessmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">No assessment data found.</p>
            <Button onClick={() => navigate('/assessment')}>
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topIntelligences = getTopIntelligences();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Your Career Assessment Results</h1>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={downloadResults}>
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
            <Button onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Intelligence Strengths */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span>Your Intelligence Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {topIntelligences.map(([intelligence, score], index) => (
                <div key={intelligence} className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="text-2xl font-bold text-blue-600 mb-2">#{index + 1}</div>
                  <div className="font-semibold text-gray-900 mb-2">{intelligence}</div>
                  <div className="text-lg text-blue-600 font-bold">{(score * 20).toFixed(0)}%</div>
                  <Badge variant="secondary" className="mt-2">Top Strength</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personality Insights */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-green-600" />
              <span>Personality Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(personalityInsights).map(([trait, score]) => (
                <div key={trait} className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="font-semibold text-gray-900 mb-2">{trait}</div>
                  <div className="text-lg text-green-600 font-bold">{(score * 20).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Career Recommendations */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <span>Career Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CareerRecommendations recommendations={careerRecommendations} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;
