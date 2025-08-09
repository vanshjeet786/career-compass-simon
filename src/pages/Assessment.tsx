
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AssessmentLayer from '@/components/AssessmentLayer';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { AssessmentService } from '@/services/assessmentService';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  category: string;
}

const Assessment = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentLayer, setCurrentLayer] = useState(0);
  const [allResponses, setAllResponses] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);

  // Assessment data structure based on the Python code
  const assessmentLayers = [
    {
      title: "Multiple Intelligences Assessment",
      description: "Discover your unique cognitive strengths across different intelligence types",
      questions: [
        { id: "linguistic_1", text: "I enjoy writing essays, stories, or journal entries for fun.", category: "Linguistic Intelligence" },
        { id: "linguistic_2", text: "I find it easy to explain complex topics in simple terms.", category: "Linguistic Intelligence" },
        { id: "logical_1", text: "I enjoy solving logical puzzles, riddles, or brain teasers.", category: "Logical-Mathematical Intelligence" },
        { id: "logical_2", text: "I analyze data, statistics, or numerical trends to make decisions.", category: "Logical-Mathematical Intelligence" },
        { id: "interpersonal_1", text: "I enjoy working in teams and collaborating with peers on projects.", category: "Interpersonal Intelligence" },
        { id: "interpersonal_2", text: "I am good at resolving conflicts between friends or classmates.", category: "Interpersonal Intelligence" },
        { id: "intrapersonal_1", text: "I regularly reflect on my personal strengths and weaknesses.", category: "Intrapersonal Intelligence" },
        { id: "intrapersonal_2", text: "I set clear personal and academic goals for myself.", category: "Intrapersonal Intelligence" },
        { id: "naturalistic_1", text: "I enjoy studying environmental topics like sustainability, ecology, or agriculture.", category: "Naturalistic Intelligence" },
        { id: "naturalistic_2", text: "I like spending time in nature and observing patterns in the environment.", category: "Naturalistic Intelligence" },
        { id: "kinesthetic_1", text: "I enjoy physical activities like sports, dance, or acting.", category: "Bodily-Kinesthetic Intelligence" },
        { id: "kinesthetic_2", text: "I learn better by doing rather than just reading or listening.", category: "Bodily-Kinesthetic Intelligence" },
        { id: "musical_1", text: "I can identify or reproduce musical patterns easily.", category: "Musical Intelligence" },
        { id: "musical_2", text: "I enjoy listening to or creating music.", category: "Musical Intelligence" },
        { id: "spatial_1", text: "I enjoy drawing, painting, or visual designing.", category: "Visual-Spatial Intelligence" },
        { id: "spatial_2", text: "I can visualize objects from different angles in my mind.", category: "Visual-Spatial Intelligence" }
      ],
      isOpenEnded: false
    },
    {
      title: "Personality Traits & Cognitive Styles",
      description: "Understand your personality patterns and cognitive preferences",
      questions: [
        { id: "mbti_1", text: "I get energized by spending time alone (I) vs with others (E).", category: "MBTI Preferences" },
        { id: "mbti_2", text: "I prefer focusing on facts (S) vs big picture ideas (N).", category: "MBTI Preferences" },
        { id: "openness_1", text: "I enjoy trying new and different activities.", category: "Big Five - Openness" },
        { id: "openness_2", text: "I am imaginative and full of ideas.", category: "Big Five - Openness" },
        { id: "conscientiousness_1", text: "I like to keep things organized and tidy.", category: "Big Five - Conscientiousness" },
        { id: "conscientiousness_2", text: "I follow through with tasks and responsibilities.", category: "Big Five - Conscientiousness" },
        { id: "extraversion_1", text: "I feel comfortable in social situations.", category: "Big Five - Extraversion" },
        { id: "extraversion_2", text: "I enjoy being the center of attention.", category: "Big Five - Extraversion" },
        { id: "agreeableness_1", text: "I am considerate and kind to almost everyone.", category: "Big Five - Agreeableness" },
        { id: "agreeableness_2", text: "I try to see things from others' perspectives.", category: "Big Five - Agreeableness" },
        { id: "autonomy_1", text: "I feel free to choose how to approach my work or study.", category: "Self-Determination - Autonomy" },
        { id: "competence_1", text: "I feel capable and effective in what I do.", category: "Self-Determination - Competence" },
        { id: "relatedness_1", text: "I feel connected and close to people around me.", category: "Self-Determination - Relatedness" }
      ],
      isOpenEnded: false
    },
    {
      title: "Aptitudes & Skills Assessment",
      description: "Evaluate your natural abilities and developed skills",
      questions: [
        { id: "numerical_1", text: "I am comfortable working with numbers and data.", category: "Numerical Aptitude" },
        { id: "numerical_2", text: "I can solve arithmetic and algebraic problems easily.", category: "Numerical Aptitude" },
        { id: "verbal_1", text: "I understand and use new vocabulary quickly.", category: "Verbal Aptitude" },
        { id: "verbal_2", text: "I can comprehend and analyze written passages.", category: "Verbal Aptitude" },
        { id: "abstract_1", text: "I can spot logical patterns in unfamiliar problems.", category: "Abstract Reasoning" },
        { id: "abstract_2", text: "I can mentally manipulate shapes and figures.", category: "Abstract Reasoning" },
        { id: "technical_1", text: "I have experience with software/tools relevant to my field.", category: "Technical Skills" },
        { id: "technical_2", text: "I can troubleshoot or learn new technical skills quickly.", category: "Technical Skills" },
        { id: "creative_1", text: "I can generate original ideas and solutions.", category: "Creative/Design Skills" },
        { id: "creative_2", text: "I am skilled at sketching, designing, or multimedia work.", category: "Creative/Design Skills" },
        { id: "communication_1", text: "I express my ideas clearly in speaking or writing.", category: "Communication Skills" },
        { id: "communication_2", text: "I adapt my message to suit the audience.", category: "Communication Skills" }
      ],
      isOpenEnded: false
    },
    {
      title: "Background & Environmental Factors",
      description: "Consider your educational background and environmental influences",
      questions: [
        { id: "education_1", text: "I have access to quality academic resources (books, teachers, labs).", category: "Educational Background" },
        { id: "education_2", text: "I attend or have attended a school/college with strong academic performance.", category: "Educational Background" },
        { id: "socioeconomic_1", text: "I have access to stable internet, computer, and other learning tools.", category: "Socioeconomic Factors" },
        { id: "socioeconomic_2", text: "My family can support me in pursuing higher education or specialized training.", category: "Socioeconomic Factors" },
        { id: "exposure_1", text: "I've interacted with professionals from various career paths.", category: "Career Exposure" },
        { id: "exposure_2", text: "I have participated in internships, shadowing, or volunteering roles.", category: "Career Exposure" }
      ],
      isOpenEnded: false
    },
    {
      title: "Interests, Values & Career Awareness",
      description: "Explore your passions, values, and career awareness",
      questions: [
        { id: "interests_1", text: "I have clear hobbies or subjects that I love spending time on.", category: "Interests and Passions" },
        { id: "interests_2", text: "I often find myself researching or learning about certain topics outside class.", category: "Interests and Passions" },
        { id: "trends_1", text: "I am aware of new and emerging fields in the job market.", category: "Career Trends Awareness" },
        { id: "trends_2", text: "I regularly explore how careers are evolving with technology and globalization.", category: "Career Trends Awareness" },
        { id: "values_1", text: "I have written down or thought deeply about my career goals.", category: "Personal Goals and Values" },
        { id: "values_2", text: "My career decisions are guided by my personal values (e.g., helping others, creativity, stability).", category: "Personal Goals and Values" }
      ],
      isOpenEnded: false
    },
    {
      title: "Self-Reflection & Future Planning",
      description: "Synthesize your insights and plan your career journey",
      questions: [
        { id: "synthesis_1", text: "Based on my intelligence strengths, the types of activities I naturally enjoy are:", category: "Self-Synthesis" },
        { id: "synthesis_2", text: "Based on my personality, I thrive in environments that are:", category: "Self-Synthesis" },
        { id: "synthesis_3", text: "The industries and roles that excite me most are:", category: "Self-Synthesis" },
        { id: "passion_1", text: "My top 3 career interest areas are:", category: "Career Interests" },
        { id: "confidence_1", text: "What's holding you back from pursuing your top career option(s)?", category: "Confidence Check" },
        { id: "confidence_2", text: "What fears or doubts do you still have about your career path?", category: "Confidence Check" },
        { id: "action_1", text: "What are 3 things you can do in the next 30 days to explore your top choice(s)?", category: "Action Planning" },
        { id: "action_2", text: "What specific skills or knowledge gaps do you need to address?", category: "Action Planning" }
      ],
      isOpenEnded: true
    }
  ];

  const handleLayerComplete = async (responses: Record<string, any>) => {
    const layerKey = `layer_${currentLayer + 1}`;
    const updatedResponses = {
      ...allResponses,
      [layerKey]: responses
    };
    setAllResponses(updatedResponses);

    // Save to database if user is authenticated
    if (isAuthenticated && user && currentAssessmentId) {
      const success = await AssessmentService.saveResponses(
        currentAssessmentId,
        currentLayer + 1,
        responses
      );
      
      if (!success) {
        toast.error('Failed to save progress. Please try again.');
        return;
      }
    }

    if (currentLayer < assessmentLayers.length - 1) {
      // Update progress in database
      if (isAuthenticated && currentAssessmentId) {
        await AssessmentService.updateAssessmentProgress(
          currentAssessmentId,
          currentLayer + 2
        );
      }
      setCurrentLayer(prev => prev + 1);
    } else {
      // Complete assessment in database
      if (isAuthenticated && currentAssessmentId) {
        await AssessmentService.completeAssessment(currentAssessmentId);
      }
      setIsComplete(true);
    }
  };

  const handleViewResults = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Store results in localStorage for the results page
    localStorage.setItem('assessmentResults', JSON.stringify(allResponses));
    localStorage.setItem('currentAssessmentId', currentAssessmentId || '');
    navigate('/results');
  };

  const handleAuthSuccess = async () => {
    if (user) {
      // Create new assessment for authenticated user
      const assessment = await AssessmentService.createAssessment(user.id);
      if (assessment) {
        setCurrentAssessmentId(assessment.id);
        toast.success('Assessment progress will now be saved to your account!');
      }
    }
  };

  // Initialize assessment for authenticated users
  React.useEffect(() => {
    const initializeAssessment = async () => {
      if (isAuthenticated && user && !currentAssessmentId) {
        // Check for existing in-progress assessment
        const existingAssessment = await AssessmentService.getCurrentAssessment(user.id);
        
        if (existingAssessment) {
          setCurrentAssessmentId(existingAssessment.id);
          setCurrentLayer(existingAssessment.current_layer - 1);
          
          // Load existing responses
          const responses = await AssessmentService.getAssessmentResponses(existingAssessment.id);
          const structuredResponses = AssessmentService.convertResponsesToStructured(responses);
          setAllResponses(structuredResponses);
          
          toast.success('Resumed your previous assessment!');
        } else {
          // Create new assessment
          const newAssessment = await AssessmentService.createAssessment(user.id);
          if (newAssessment) {
            setCurrentAssessmentId(newAssessment.id);
          }
        }
      }
    };

    initializeAssessment();
  }, [isAuthenticated, user, currentAssessmentId]);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl mb-4">Assessment Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-lg text-gray-600">
              Congratulations! You've completed all 6 layers of the career assessment. 
              Your personalized career recommendations are ready.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-900">Completed</div>
                <div className="text-2xl font-bold text-blue-600">6/6</div>
                <div className="text-blue-700">Assessment Layers</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-900">Analyzed</div>
                <div className="text-2xl font-bold text-green-600">75+</div>
                <div className="text-green-700">Data Points</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-900">Generated</div>
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-purple-700">Possibilities</div>
              </div>
            </div>
            <Button
              onClick={handleViewResults}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4"
            >
              View Your Career Results
            </Button>
          </CardContent>
        </Card>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <AssessmentLayer
      title={assessmentLayers[currentLayer].title}
      description={assessmentLayers[currentLayer].description}
      questions={assessmentLayers[currentLayer].questions}
      isOpenEnded={assessmentLayers[currentLayer].isOpenEnded}
      onComplete={handleLayerComplete}
      currentLayer={currentLayer + 1}
      totalLayers={assessmentLayers.length}
    />
  );
};

export default Assessment;
