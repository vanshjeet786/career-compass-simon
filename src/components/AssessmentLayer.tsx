
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: string;
  text: string;
  category: string;
}

interface AssessmentLayerProps {
  title: string;
  description: string;
  questions: Question[];
  isOpenEnded?: boolean;
  onComplete: (responses: Record<string, any>) => void;
  currentLayer: number;
  totalLayers: number;
}

const AssessmentLayer: React.FC<AssessmentLayerProps> = ({
  title,
  description,
  questions,
  isOpenEnded = false,
  onComplete,
  currentLayer,
  totalLayers
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const responseScale = {
    "Strongly Disagree": 1,
    "Disagree": 2,
    "Neutral": 3,
    "Agree": 4,
    "Strongly Agree": 5
  };

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(responses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <span className="text-sm text-gray-600">
              Layer {currentLayer} of {totalLayers}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{description}</p>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-800 mb-6">
                {currentQuestion.text}
              </p>

              {isOpenEnded ? (
                <div className="space-y-4">
                  <Label htmlFor="response">Your Response:</Label>
                  <Textarea
                    id="response"
                    value={responses[currentQuestion.id] || ''}
                    onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                    placeholder="Share your thoughts..."
                    className="min-h-[120px]"
                  />
                </div>
              ) : (
                <RadioGroup
                  value={responses[currentQuestion.id]?.toString() || ''}
                  onValueChange={(value) => handleResponse(currentQuestion.id, parseInt(value))}
                >
                  {Object.entries(responseScale).map(([label, value]) => (
                    <div key={value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <RadioGroupItem value={value.toString()} id={`option-${value}`} />
                      <Label htmlFor={`option-${value}`} className="cursor-pointer flex-1">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!responses[currentQuestion.id]}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Complete Layer' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentLayer;
