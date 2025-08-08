
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Users, Lightbulb, TrendingUp, CheckCircle, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "Multiple Intelligences Assessment",
      description: "Discover your unique cognitive strengths across 8 different intelligence types"
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Personality & Aptitude Analysis",
      description: "Deep dive into your personality traits, cognitive styles, and natural abilities"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Background & Context Evaluation",
      description: "Consider your educational background, socioeconomic factors, and career exposure"
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-600" />,
      title: "Interests & Values Mapping",
      description: "Align your personal interests, values, and life goals with career options"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-red-600" />,
      title: "AI-Powered Recommendations",
      description: "Get personalized career suggestions based on advanced machine learning analysis"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-indigo-600" />,
      title: "Action Planning",
      description: "Receive concrete steps and timelines to pursue your ideal career path"
    }
  ];

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleAuthSuccess = () => {
    toast.success('Welcome! You can now start your assessment.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Auth Status Bar */}
        {isAuthenticated && user && (
          <div className="flex justify-end mb-8">
            <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Driven Career Compass
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover your ideal career path through comprehensive assessment of your intelligences, 
            personality, aptitudes, and aspirations with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleStartAssessment}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              {isAuthenticated ? 'Continue Assessment' : 'Start Your Career Assessment'}
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 text-lg"
              >
                Sign In to Save Progress
              </Button>
            )}
          </div>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-4">
              Sign in to save your progress and access your results anytime
            </p>
          )}
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assessment Layers Preview */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">6-Layer Assessment Framework</CardTitle>
            <CardDescription className="text-lg">
              Our comprehensive evaluation process covers every aspect of your professional identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-2">Layer 1: Multiple Intelligences</h3>
                <p className="text-sm text-blue-700">Linguistic, Mathematical, Spatial, Musical, and more</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-900 mb-2">Layer 2: Personality Traits</h3>
                <p className="text-sm text-green-700">MBTI, Big Five, Self-Determination Theory</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <h3 className="font-semibold text-purple-900 mb-2">Layer 3: Aptitudes</h3>
                <p className="text-sm text-purple-700">Numerical, Verbal, Abstract, Technical Skills</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <h3 className="font-semibold text-yellow-900 mb-2">Layer 4: Background Factors</h3>
                <p className="text-sm text-yellow-700">Education, Socioeconomic, Career Exposure</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">Layer 5: Interests & Values</h3>
                <p className="text-sm text-red-700">Passions, Career Trends, Personal Goals</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-indigo-50">
                <h3 className="font-semibold text-indigo-900 mb-2">Layer 6: Self-Synthesis</h3>
                <p className="text-sm text-indigo-700">Reflection, Planning, Confidence Building</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
          >
            Start Your Career Assessment
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assessment Layers Preview */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">6-Layer Assessment Framework</CardTitle>
            <CardDescription className="text-lg">
              Our comprehensive evaluation process covers every aspect of your professional identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-2">Layer 1: Multiple Intelligences</h3>
                <p className="text-sm text-blue-700">Linguistic, Mathematical, Spatial, Musical, and more</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-900 mb-2">Layer 2: Personality Traits</h3>
                <p className="text-sm text-green-700">MBTI, Big Five, Self-Determination Theory</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <h3 className="font-semibold text-purple-900 mb-2">Layer 3: Aptitudes</h3>
                <p className="text-sm text-purple-700">Numerical, Verbal, Abstract, Technical Skills</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <h3 className="font-semibold text-yellow-900 mb-2">Layer 4: Background Factors</h3>
                <p className="text-sm text-yellow-700">Education, Socioeconomic, Career Exposure</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">Layer 5: Interests & Values</h3>
                <p className="text-sm text-red-700">Passions, Career Trends, Personal Goals</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-indigo-50">
                <h3 className="font-semibold text-indigo-900 mb-2">Layer 6: Self-Synthesis</h3>
                <p className="text-sm text-indigo-700">Reflection, Planning, Confidence Building</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
