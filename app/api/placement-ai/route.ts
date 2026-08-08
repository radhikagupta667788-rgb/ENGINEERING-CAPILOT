import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authHeader =
      request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
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

    const {
      data: progress,
      error: progressError,
    } = await supabase
      .from("placement_progress")
      .select(
        "dsa,sql_progress,core_cs,aptitude,projects"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (progressError) {
      return NextResponse.json(
        {
          success: false,
          error: progressError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Placement progress not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GROQ_API_KEY missing",
        },
        {
          status: 500,
        }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const response =
      await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",

        temperature: 0.3,

        messages: [
          {
            role: "system",
            content: `
You are the Placement Intelligence AI inside AI Engineering Copilot.

Your job is to analyze a student's placement preparation progress and recommend what they should focus on next.

Be practical and concise.

Return the response in this format:

Placement Readiness:
Give a short overall assessment.

Priority 1:
What to study next and why.

Priority 2:
Second most important area.

Priority 3:
Third important area.

Today's Plan:
- Task 1
- Task 2
- Task 3
- Task 4

Placement Tip:
One useful actionable placement tip.
`,
          },
          {
            role: "user",
            content: `
Current placement progress:

DSA: ${progress.dsa ?? 0}%
SQL & Database: ${progress.sql_progress ?? 0}%
Core CS: ${progress.core_cs ?? 0}%
Aptitude: ${progress.aptitude ?? 0}%
Projects: ${progress.projects ?? 0}%

Analyze this progress and tell the student exactly what they should focus on next.
`,
          },
        ],
      });

    const recommendation =
      response.choices[0]?.message?.content ||
      "No recommendation generated.";

    const {
      error: activityError,
    } = await supabase
      .from("activities")
      .insert({
        user_id: user.id,
        action:
          "Generated AI Placement Recommendation",
      });

    if (activityError) {
      console.log(
        "PLACEMENT AI ACTIVITY ERROR:",
        activityError
      );
    }

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error: unknown) {
    console.log(
      "PLACEMENT AI ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Placement AI failed",
      },
      {
        status: 500,
      }
    );
  }
}