
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Clock, Users } from 'lucide-react';

interface CareerMatch {
  title: string;
  matchPercentage: number;
  description: string;
  requiredSkills: string[];
  salaryRange: string;
  jobOutlook: string;
  workEnvironment: string[];
  category: string;
}

interface CareerRecommendationsProps {
  recommendations: CareerMatch[];
}

const CareerRecommendations: React.FC<CareerRecommendationsProps> = ({ recommendations }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Creative': 'bg-purple-100 text-purple-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Business': 'bg-yellow-100 text-yellow-800',
      'Education': 'bg-red-100 text-red-800',
      'Science': 'bg-indigo-100 text-indigo-800',
      'Engineering': 'bg-gray-100 text-gray-800',
      'Social': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Personalized Career Recommendations</h2>
      
      {recommendations.map((career, index) => (
        <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{career.title}</CardTitle>
                <Badge className={getCategoryColor(career.category)}>
                  {career.category}
                </Badge>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getMatchColor(career.matchPercentage)}`}>
                  {career.matchPercentage}%
                </div>
                <div className="text-sm text-gray-500">Match</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={career.matchPercentage} className="w-full" />
            
            <p className="text-gray-600">{career.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Salary Range:</span>
                  <span className="text-gray-600">{career.salaryRange}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">Job Outlook:</span>
                  <span className="text-gray-600">{career.jobOutlook}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold">Work Environment:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {career.workEnvironment.map((env, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {env}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-semibold">Required Skills:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {career.requiredSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CareerRecommendations;
