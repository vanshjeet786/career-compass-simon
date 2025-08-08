import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Assessment = Database['public']['Tables']['assessments']['Row'];
type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
type AssessmentResponse = Database['public']['Tables']['assessment_responses']['Row'];
type AssessmentResponseInsert = Database['public']['Tables']['assessment_responses']['Insert'];
type AssessmentResult = Database['public']['Tables']['assessment_results']['Row'];
type AssessmentResultInsert = Database['public']['Tables']['assessment_results']['Insert'];

export class AssessmentService {
  // Create a new assessment
  static async createAssessment(userId: string): Promise<Assessment | null> {
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        status: 'in_progress',
        current_layer: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      return null;
    }

    return data;
  }

  // Get user's current assessment
  static async getCurrentAssessment(userId: string): Promise<Assessment | null> {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching current assessment:', error);
      return null;
    }

    return data;
  }

  // Get all user assessments
  static async getUserAssessments(userId: string): Promise<Assessment[]> {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user assessments:', error);
      return [];
    }

    return data || [];
  }

  // Update assessment progress
  static async updateAssessmentProgress(
    assessmentId: string, 
    currentLayer: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from('assessments')
      .update({ current_layer: currentLayer })
      .eq('id', assessmentId);

    if (error) {
      console.error('Error updating assessment progress:', error);
      return false;
    }

    return true;
  }

  // Complete assessment
  static async completeAssessment(assessmentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('assessments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assessmentId);

    if (error) {
      console.error('Error completing assessment:', error);
      return false;
    }

    return true;
  }

  // Save assessment responses
  static async saveResponses(
    assessmentId: string,
    layerNumber: number,
    responses: Record<string, any>
  ): Promise<boolean> {
    const responseInserts: AssessmentResponseInsert[] = Object.entries(responses).map(
      ([questionId, responseValue]) => ({
        assessment_id: assessmentId,
        layer_number: layerNumber,
        question_id: questionId,
        response_value: responseValue
      })
    );

    const { error } = await supabase
      .from('assessment_responses')
      .upsert(responseInserts, { 
        onConflict: 'assessment_id,question_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error saving assessment responses:', error);
      return false;
    }

    return true;
  }

  // Get assessment responses
  static async getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('layer_number', { ascending: true });

    if (error) {
      console.error('Error fetching assessment responses:', error);
      return [];
    }

    return data || [];
  }

  // Save assessment results
  static async saveResults(
    assessmentId: string,
    intelligenceScores: Record<string, number>,
    personalityInsights: Record<string, number>,
    careerRecommendations: any[],
    aiExplanations?: any
  ): Promise<boolean> {
    const resultData: AssessmentResultInsert = {
      assessment_id: assessmentId,
      intelligence_scores: intelligenceScores,
      personality_insights: personalityInsights,
      career_recommendations: careerRecommendations,
      ai_explanations: aiExplanations || {}
    };

    const { error } = await supabase
      .from('assessment_results')
      .upsert(resultData, { 
        onConflict: 'assessment_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error saving assessment results:', error);
      return false;
    }

    return true;
  }

  // Get assessment results
  static async getAssessmentResults(assessmentId: string): Promise<AssessmentResult | null> {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching assessment results:', error);
      return null;
    }

    return data;
  }

  // Convert responses to structured format
  static convertResponsesToStructured(responses: AssessmentResponse[]): Record<string, any> {
    const structured: Record<string, any> = {};
    
    responses.forEach(response => {
      const layerKey = `layer_${response.layer_number}`;
      if (!structured[layerKey]) {
        structured[layerKey] = {};
      }
      structured[layerKey][response.question_id] = response.response_value;
    });

    return structured;
  }
}