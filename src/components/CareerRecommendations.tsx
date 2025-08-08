
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Clock, Users, ExternalLink } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface CareerMatch {
  title: string;
  matchPercentage: number;
  description: string;
  requiredSkills: string[];
  salaryRange: string;
  jobOutlook: string;
  workEnvironment: string[];
  category: string;
  matchFactors?: string[];
}

interface CareerRecommendationsProps {
  recommendations: CareerMatch[];
  explanationsByCareer?: Record<string, { rationale: string[]; skillGaps: string[] }>;
}

const CareerRecommendations: React.FC<CareerRecommendationsProps> = ({ recommendations, explanationsByCareer }) => {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-primary';
    if (percentage >= 80) return 'text-foreground';
    if (percentage >= 70) return 'text-muted-foreground';
    return 'text-muted-foreground';
  };

  const getOnetUrl = (title: string) => `https://www.onetonline.org/find/quick?s=${encodeURIComponent(title)}`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Your Personalized Career Recommendations</h2>
      
      {recommendations.map((career, index) => {
        const expl = explanationsByCareer?.[career.title];
        return (
          <Card
            key={index}
            className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 hover-scale animate-fade-in"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{career.title}</CardTitle>
                  <Badge variant="secondary">{career.category}</Badge>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getMatchColor(career.matchPercentage)}`} aria-label="career-match-percentage">
                    {career.matchPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Match</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={career.matchPercentage} className="w-full" />
              
              <p className="text-muted-foreground">{career.description}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Salary Range:</span>
                    <span className="text-muted-foreground">{career.salaryRange}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Job Outlook:</span>
                    <span className="text-muted-foreground">{career.jobOutlook}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
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
                  <Clock className="h-4 w-4 text-primary" />
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

              {expl && (
                <div className="pt-2">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="why">
                      <AccordionTrigger className="text-sm">Why this fits you</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          {(expl.rationale || []).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="gaps">
                      <AccordionTrigger className="text-sm">Potential skill gaps</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          {(expl.skillGaps || []).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={getOnetUrl(career.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline story-link"
                  aria-label={`Learn more about ${career.title} on O*NET`}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Learn more on O*NET</span>
                </a>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CareerRecommendations;
