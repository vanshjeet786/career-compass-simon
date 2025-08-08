import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceApiKey = Deno.env.get("HUGGINGFACE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

type TopIntelligence = { type: string; score: number };
type PersonalityInsights = Record<string, number>;
type CareerItem = {
  title: string;
  matchPercentage: number;
  matchFactors?: string[];
  category?: string;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!huggingFaceApiKey) {
    return new Response(JSON.stringify({ error: "Missing HUGGINGFACE_API_KEY" }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    const { topIntelligences, personalityInsights, careers, userContext } = await req.json() as {
      topIntelligences: TopIntelligence[];
      personalityInsights: PersonalityInsights;
      careers: CareerItem[];
      userContext?: string;
    };

    // Create a comprehensive prompt for the AI model
    const prompt = createCareerAnalysisPrompt(topIntelligences, personalityInsights, careers, userContext);

    // Use Hugging Face Inference API with a suitable model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${huggingFaceApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errTxt = await response.text();
      console.error("Hugging Face API error:", errTxt);
      
      // Fallback to rule-based explanations if API fails
      const fallbackExplanations = generateFallbackExplanations(
        topIntelligences,
        personalityInsights,
        careers
      );
      
      return new Response(JSON.stringify(fallbackExplanations), { 
        headers: corsHeaders 
      });
    }

    const data = await response.json();
    let aiResponse = "";
    
    if (Array.isArray(data) && data.length > 0) {
      aiResponse = data[0].generated_text || "";
    }

    // Parse the AI response and structure it
    const structuredExplanations = parseAIResponse(
      aiResponse,
      topIntelligences,
      personalityInsights,
      careers
    );

    return new Response(JSON.stringify(structuredExplanations), { 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("generate-explanations function error:", error);
    
    // Return fallback explanations on any error
    try {
      const { topIntelligences, personalityInsights, careers } = await req.json();
      const fallbackExplanations = generateFallbackExplanations(
        topIntelligences,
        personalityInsights,
        careers
      );
      
      return new Response(JSON.stringify(fallbackExplanations), {
        headers: corsHeaders,
      });
    } catch {
      return new Response(JSON.stringify({ error: "Unexpected server error" }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }
});

function createCareerAnalysisPrompt(
  topIntelligences: TopIntelligence[],
  personalityInsights: PersonalityInsights,
  careers: CareerItem[],
  userContext?: string
): string {
  const intelligenceList = topIntelligences
    .map(intel => `${intel.type}: ${(intel.score * 20).toFixed(0)}%`)
    .join(", ");

  const personalityList = Object.entries(personalityInsights)
    .map(([trait, score]) => `${trait}: ${(score * 20).toFixed(0)}%`)
    .join(", ");

  const careerList = careers
    .slice(0, 5)
    .map(career => `${career.title} (${career.matchPercentage}% match)`)
    .join(", ");

  return `
As a career counselor, analyze this person's profile and provide structured insights:

Top Intelligence Strengths: ${intelligenceList}
Personality Traits: ${personalityList}
Recommended Careers: ${careerList}
${userContext ? `Additional Context: ${userContext}` : ''}

Please provide:
1. A brief executive summary of their career fit
2. Explanation of why each top intelligence strength matters for their career
3. How their personality traits influence their work preferences
4. Why each recommended career is a good match and what skills they might need to develop

Keep responses practical, encouraging, and specific to their profile.
  `.trim();
}

function parseAIResponse(
  aiResponse: string,
  topIntelligences: TopIntelligence[],
  personalityInsights: PersonalityInsights,
  careers: CareerItem[]
): any {
  // If AI response is too short or unclear, use fallback
  if (!aiResponse || aiResponse.length < 100) {
    return generateFallbackExplanations(topIntelligences, personalityInsights, careers);
  }

  // Try to extract structured information from AI response
  const sections = aiResponse.split(/\d+\./);
  
  const executiveSummary = sections[1]?.trim() || generateExecutiveSummary(topIntelligences, careers);
  
  const intelligencesExplained: Record<string, string> = {};
  topIntelligences.forEach((intel, index) => {
    intelligencesExplained[intel.type] = sections[2]?.trim() || 
      getIntelligenceExplanation(intel.type, intel.score);
  });

  const personalityExplained: Record<string, string> = {};
  Object.keys(personalityInsights).forEach(trait => {
    personalityExplained[trait] = sections[3]?.trim() || 
      getPersonalityExplanation(trait, personalityInsights[trait]);
  });

  const careersExplained: Record<string, { rationale: string[]; skillGaps: string[] }> = {};
  careers.slice(0, 5).forEach(career => {
    careersExplained[career.title] = {
      rationale: [
        sections[4]?.trim() || `Strong match based on your ${career.matchFactors?.join(', ')} strengths`,
        `${career.matchPercentage}% compatibility with your profile`,
        `Growing field in ${career.category} sector`
      ],
      skillGaps: [
        "Consider developing technical skills specific to this role",
        "Build industry-specific knowledge through courses or certifications",
        "Gain practical experience through projects or internships"
      ]
    };
  });

  return {
    executiveSummary,
    intelligencesExplained,
    personalityExplained,
    careersExplained
  };
}

function generateFallbackExplanations(
  topIntelligences: TopIntelligence[],
  personalityInsights: PersonalityInsights,
  careers: CareerItem[]
): any {
  const executiveSummary = generateExecutiveSummary(topIntelligences, careers);
  
  const intelligencesExplained: Record<string, string> = {};
  topIntelligences.forEach(intel => {
    intelligencesExplained[intel.type] = getIntelligenceExplanation(intel.type, intel.score);
  });

  const personalityExplained: Record<string, string> = {};
  Object.entries(personalityInsights).forEach(([trait, score]) => {
    personalityExplained[trait] = getPersonalityExplanation(trait, score);
  });

  const careersExplained: Record<string, { rationale: string[]; skillGaps: string[] }> = {};
  careers.slice(0, 5).forEach(career => {
    careersExplained[career.title] = {
      rationale: [
        `Strong alignment with your ${career.matchFactors?.join(' and ')} abilities`,
        `${career.matchPercentage}% match based on your assessment responses`,
        `Excellent growth potential in the ${career.category} field`
      ],
      skillGaps: [
        "Develop industry-specific technical skills",
        "Build professional network in this field",
        "Gain hands-on experience through projects or internships"
      ]
    };
  });

  return {
    executiveSummary,
    intelligencesExplained,
    personalityExplained,
    careersExplained
  };
}

function generateExecutiveSummary(topIntelligences: TopIntelligence[], careers: CareerItem[]): string {
  const topIntel = topIntelligences[0]?.type || "analytical";
  const topCareer = careers[0]?.title || "your recommended field";
  
  return `Based on your assessment, you show exceptional strength in ${topIntel} intelligence, making you well-suited for ${topCareer}. Your cognitive profile suggests you'll thrive in environments that leverage your natural abilities while providing opportunities for growth and meaningful contribution.`;
}

function getIntelligenceExplanation(type: string, score: number): string {
  const explanations: Record<string, string> = {
    "Linguistic": "Your strong verbal and written communication skills make you excellent at expressing ideas, teaching, and working with language-based tasks.",
    "Logical-Mathematical": "Your analytical thinking and problem-solving abilities are key strengths for careers requiring systematic reasoning and quantitative analysis.",
    "Visual-Spatial": "Your ability to visualize and manipulate spatial relationships makes you well-suited for design, architecture, and creative fields.",
    "Musical": "Your sensitivity to rhythm, melody, and sound patterns can be valuable in creative industries and roles requiring attention to auditory details.",
    "Bodily-Kinesthetic": "Your physical coordination and hands-on learning style make you effective in roles requiring manual dexterity and practical application.",
    "Interpersonal": "Your ability to understand and work well with others makes you valuable in team environments, leadership roles, and people-focused careers.",
    "Intrapersonal": "Your self-awareness and ability to work independently are strengths for roles requiring self-direction and personal reflection.",
    "Naturalistic": "Your connection with nature and ability to recognize patterns in the natural world suit you for environmental and scientific careers."
  };
  
  return explanations[type] || "This intelligence type represents a unique strength that can be applied across various career paths.";
}

function getPersonalityExplanation(trait: string, score: number): string {
  const level = score >= 4 ? "high" : score >= 3 ? "moderate" : "lower";
  
  const explanations: Record<string, Record<string, string>> = {
    "Openness": {
      "high": "You're highly creative and open to new experiences, thriving in innovative and dynamic work environments.",
      "moderate": "You balance creativity with practicality, adapting well to both routine and novel situations.",
      "lower": "You prefer structured environments and proven methods, excelling in roles with clear procedures."
    },
    "Conscientiousness": {
      "high": "You're highly organized and goal-oriented, making you reliable for deadline-driven and detail-oriented work.",
      "moderate": "You balance structure with flexibility, adapting your approach based on the situation.",
      "lower": "You work best in flexible environments that don't require rigid adherence to schedules."
    },
    "Extraversion": {
      "high": "You're energized by social interaction and thrive in collaborative, people-focused roles.",
      "moderate": "You're comfortable in both social and independent work settings.",
      "lower": "You prefer quieter work environments and excel in roles requiring deep focus and independent work."
    },
    "Agreeableness": {
      "high": "You're highly cooperative and work well in team environments, making you valuable for collaborative projects.",
      "moderate": "You balance cooperation with assertiveness, adapting your approach to different situations.",
      "lower": "You're comfortable with competition and direct communication, suited for leadership and negotiation roles."
    }
  };
  
  return explanations[trait]?.[level] || `Your ${trait} level of ${level} influences how you approach work and relationships.`;
}