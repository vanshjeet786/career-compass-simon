
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

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

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
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

    const systemPrompt = [
      "You are a concise, supportive career guidance assistant.",
      "Return ONLY valid JSON (no markdown) with this exact shape:",
      "{",
      '  "executiveSummary": string,',
      '  "intelligencesExplained": Record<string,string>,',
      '  "personalityExplained": Record<string,string>,',
      '  "careersExplained": Record<string,{ "rationale": string[], "skillGaps": string[] }>',
      "}",
      "Guidelines:",
      "- Keep language plain and encouraging.",
      "- Be specific and practical.",
      "- For intelligences/personality, use the EXACT keys provided in input.",
      "- For careers, use the EXACT career titles provided in input as keys.",
      "- Limit rationale and skill gaps to 3 concise bullet points each.",
      "- Do not include sources or external links.",
      "- No duplication across sections.",
    ].join("\n");

    const userPayload = {
      topIntelligences,
      personalityInsights,
      careers,
      userContext: userContext ?? null,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Generate structured explanations for this user profile. Use the exact keys as provided.\n" +
              JSON.stringify(userPayload),
          },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error("OpenAI error:", errTxt);
      return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";

    // Ensure parsable JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI JSON:", content);
      parsed = {
        executiveSummary: "Here’s a concise summary of your strengths and potential career fit.",
        intelligencesExplained: {},
        personalityExplained: {},
        careersExplained: {},
      };
    }

    return new Response(JSON.stringify(parsed), { headers: corsHeaders });
  } catch (error) {
    console.error("generate-explanations function error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
