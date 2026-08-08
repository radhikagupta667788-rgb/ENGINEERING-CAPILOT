import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // ================= AUTH =================

    const authHeader =
      request.headers.get("authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authHeader.replace("Bearer ", "");

    const supabase =
      createServerSupabase(token);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user session",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user.id;

    // ================= INPUT =================

    const { code, mode } =
      await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Code missing",
        },
        {
          status: 400,
        }
      );
    }

    const selectedMode =
      mode || "Review";

    // ================= MODES =================

    const modeInstructions: Record<
      string,
      string
    > = {
      Review: `
Review this code like a senior software engineer.

Give:
1. Code quality review
2. Bugs or risky areas
3. Best practices
4. Readability improvements
5. Improved code if needed
      `,

      Debug: `
Debug the provided code.

Give:
1. Exact errors or bugs
2. Why the errors happen
3. Step-by-step fix
4. Corrected code
5. How to avoid the same mistake
      `,

      Explain: `
Explain this code to a student.

Give:
1. What the code does
2. Important line-by-line explanation
3. Functions/classes/logic
4. Time complexity if relevant
5. Simple summary
      `,

      Optimize: `
Optimize the provided code.

Give:
1. Current inefficiencies
2. Better approach
3. Optimized code
4. Time and space complexity
5. Why the optimized version is better
      `,
    };

    const instruction =
      modeInstructions[selectedMode] ||
      modeInstructions.Review;

    // ================= AI =================

    const groq = new Groq({
      apiKey:
        process.env.GROQ_API_KEY,
    });

    const response =
      await groq.chat.completions.create({
        model:
          "llama-3.1-8b-instant",

        messages: [
          {
            role: "system",

            content: `
You are the Code Lab AI inside an AI Engineering Copilot.

You are an expert software engineer and coding mentor.

Always:
- Be accurate
- Explain clearly
- Preserve the programming language
- Use readable formatting
- Do not invent bugs
- Provide corrected code when useful

Current operation:

${instruction}
            `,
          },

          {
            role: "user",

            content: `
Operation: ${selectedMode}

Analyze this code:

\`\`\`
${code}
\`\`\`
            `,
          },
        ],

        temperature: 0.2,
      });

    const answer =
      response.choices[0]
        ?.message?.content ||
      "No analysis generated.";

    // ================= PROGRESS =================

    const {
      data: progress,
      error: progressError,
    } = await supabase
      .from("progress")
      .select("*")
      .eq("userid", userId)
      .maybeSingle();

    if (progressError) {
      console.log(
        "Progress read error:",
        progressError
      );
    }

    if (progress) {
      const {
        error: updateError,
      } = await supabase
        .from("progress")
        .update({
          coding_count:
            (progress.coding_count || 0) + 1,
        })
        .eq("userid", userId);

      if (updateError) {
        console.log(
          "Progress update error:",
          updateError
        );
      }
    } else {
      const {
        error: insertProgressError,
      } = await supabase
        .from("progress")
        .insert({
          userid: userId,
          coding_count: 1,
          streak: 0,
          ai_chats: 0,
          resume_score: 0,
        });

      if (insertProgressError) {
        console.log(
          "Progress insert error:",
          insertProgressError
        );
      }
    }

    // ================= ACTIVITY =================

    const {
      error: activityError,
    } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        action:
          `Used Code Lab - ${selectedMode}`,
      });

    if (activityError) {
      console.log(
        "Activity insert error:",
        activityError
      );
    }

    // ================= RESPONSE =================

    return NextResponse.json({
      success: true,
      mode: selectedMode,
      answer,
    });
  } catch (error: unknown) {
    console.log(
      "Coding API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze code",
      },
      {
        status: 500,
      }
    );
  }
}