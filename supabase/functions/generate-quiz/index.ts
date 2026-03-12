import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getClientIp, isRateLimited, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_LEVELS = [
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = getClientIp(req);
  if (isRateLimited(ip)) return rateLimitResponse(corsHeaders);

  try {
    const body = await req.json();

    const topic = String(body.topic ?? "").trim().slice(0, 300);
    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const classLevel = ALLOWED_LEVELS.includes(body.classLevel) ? body.classLevel : "JSS1";
    const explanation = String(body.explanation ?? "").trim().slice(0, 4000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a quiz generator for Nigerian ${classLevel} students. Based on the topic and explanation provided, generate quiz questions to test understanding.`;

    const userPrompt = `Topic: <student_input>${topic}</student_input>
Class Level: ${classLevel}
Explanation given: <student_input>${explanation}</student_input>

Generate 10 multiple-choice questions and 3 descriptive questions based on this topic and explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate multiple-choice and descriptive quiz questions",
              parameters: {
                type: "object",
                properties: {
                  mcqs: {
                    type: "array",
                    description: "10 multiple choice questions",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "object",
                          properties: {
                            A: { type: "string" },
                            B: { type: "string" },
                            C: { type: "string" },
                            D: { type: "string" },
                          },
                          required: ["A", "B", "C", "D"],
                          additionalProperties: false,
                        },
                        correct: { type: "string", enum: ["A", "B", "C", "D"] },
                      },
                      required: ["question", "options", "correct"],
                      additionalProperties: false,
                    },
                  },
                  descriptive: {
                    type: "array",
                    description: "3 open-ended descriptive questions",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                      },
                      required: ["question"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["mcqs", "descriptive"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Failed to generate quiz" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No quiz data returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const quiz = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(quiz), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
