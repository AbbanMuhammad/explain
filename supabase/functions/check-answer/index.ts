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

    const question = String(body.question ?? "").trim().slice(0, 1000);
    const studentAnswer = String(body.studentAnswer ?? "").trim().slice(0, 2000);
    const topic = String(body.topic ?? "").trim().slice(0, 300);
    const classLevel = ALLOWED_LEVELS.includes(body.classLevel) ? body.classLevel : "JSS1";

    if (!question || !studentAnswer || !topic) {
      return new Response(JSON.stringify({ error: "Question, answer, and topic are required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are ExplainIt, a friendly and encouraging tutor for Nigerian secondary school students (${classLevel} level).

A student just answered a descriptive question about a topic. Your job is to:
1. Check if the answer is correct, partially correct, or incorrect.
2. Point out what the student got right (be encouraging!).
3. Gently correct any mistakes or misconceptions.
4. Provide the ideal/model answer so the student can learn.
5. Keep your language simple and appropriate for a ${classLevel} student.

Format your response with these sections:
**Score:** (Excellent ✅ / Good 👍 / Needs Improvement 🔄)
**What you got right:** ...
**Corrections:** ... (skip if fully correct)
**Model Answer:** ...
**Tip:** One short study tip related to this topic.`,
          },
          {
            role: "user",
            content: `Topic: <student_input>${topic}</student_input>\n\nQuestion: <student_input>${question}</student_input>\n\nStudent's Answer: <student_input>${studentAnswer}</student_input>`,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Failed to check answer" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("check-answer error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
