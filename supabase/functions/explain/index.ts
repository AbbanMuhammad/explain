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
    const simpler = Boolean(body.simpler);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const simplerInstruction = simpler
      ? `The student found the previous explanation too complex. Please:
1. Explain it even MORE simply — use very short sentences, everyday language, and relatable examples a young child could understand. Avoid any technical jargon.
2. Give a LONGER and MORE DETAILED explanation than before, breaking it into more steps with additional examples from everyday Nigerian life.
3. At the end, include a "References & Further Reading" section with 2-4 clickable online links the student can visit to learn more. Use real, working URLs from sites like Khan Academy (khanacademy.org), BBC Bitesize (bbc.co.uk/bitesize), CK-12 (ck12.org), Wikipedia, or other reputable educational websites. Format each reference as a markdown link on its own line starting with "📚", e.g. "📚 [Topic Name - Khan Academy](https://www.khanacademy.org/...)".`
      : "";

    const systemPrompt = `You are ExplainIt, a friendly and patient tutor for Nigerian secondary school students.
Your job is to explain topics in plain, easy-to-understand language appropriate for a ${classLevel} student in the Nigerian curriculum.

Rules:
- Use simple English, short paragraphs, and relatable everyday examples
- If relevant, relate concepts to Nigerian life, culture, or environment
- Break complex ideas into small, digestible steps
- Use bullet points or numbered lists when helpful
- Be encouraging and supportive
- Keep explanations concise but thorough (aim for 150-300 words)
${simplerInstruction}`;

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
          { role: "user", content: `Please explain this topic for a ${classLevel} student: <student_input>${topic}</student_input>` },
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
      return new Response(JSON.stringify({ error: "Failed to get explanation" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("explain error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
