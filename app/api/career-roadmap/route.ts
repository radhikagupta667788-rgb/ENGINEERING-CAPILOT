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

    // USER PROFILE
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("user_profiles")
      .select(
        "target_role,skills,bio"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.log(
        "CAREER PROFILE ERROR:",
        profileError
      );
    }

    const targetRole =
      profile?.target_role ||
      "Software Engineer";

    const skills =
      profile?.skills ||
      "Not provided";

    // PLACEMENT PROGRESS
    const {
      data: placement,
      error: placementError,
    } = await supabase
      .from("placement_progress")
      .select(
        "dsa,sql_progress,core_cs,aptitude,projects"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (placementError) {
      console.log(
        "CAREER PLACEMENT ERROR:",
        placementError
      );
    }

    const dsa =
      placement?.dsa ?? 0;

    const sql =
      placement?.sql_progress ?? 0;

    const coreCS =
      placement?.core_cs ?? 0;

    const aptitude =
      placement?.aptitude ?? 0;

    const projects =
      placement?.projects ?? 0;

    const readiness =
      Math.round(
        (
          dsa +
          sql +
          coreCS +
          aptitude +
          projects
        ) / 5
      );

    // GROQ
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
      apiKey:
        process.env.GROQ_API_KEY,
    });

    const response =
      await groq.chat.completions.create({
        model:
          "llama-3.1-8b-instant",

        temperature: 0.3,

        messages: [
          {
            role: "system",
            content: `
You are the Career Intelligence Engine inside AI Engineering Copilot.

Create a practical personalized career roadmap for an engineering student.

Use this structure:

CAREER TARGET

CURRENT READINESS

TOP SKILL GAPS
1.
2.
3.

30 DAY ROADMAP

WEEK 1
- Task
- Task
- Task

WEEK 2
- Task
- Task
- Task

WEEK 3
- Task
- Task
- Task

WEEK 4
- Task
- Task
- Task

PROJECT STRATEGY

INTERVIEW STRATEGY

DAILY ROUTINE

FINAL ADVICE

Rules:
- Use the target role and current skills.
- Prioritize weak preparation areas.
- Keep recommendations practical.
- Avoid generic advice.
`,
          },

          {
            role: "user",
            content: `
Target Role:
${targetRole}

Current Skills:
${skills}

Placement Readiness:
${readiness}%

DSA:
${dsa}%

SQL:
${sql}%

Core CS:
${coreCS}%

Aptitude:
${aptitude}%

Projects:
${projects}%

Generate a personalized 30-day career roadmap.
`,
          },
        ],
      });

    const roadmap =
      response.choices[0]
        ?.message?.content ||
      "No roadmap generated.";

    // SAVE ROADMAP
    const {
      data: savedRoadmap,
      error: roadmapError,
    } = await supabase
      .from("career_roadmaps")
      .insert({
        user_id: user.id,
        target_role: targetRole,
        roadmap,
        readiness,
      })
      .select(
        "id,target_role,roadmap,readiness,created_at"
      )
      .single();

    if (roadmapError) {
      console.log(
        "ROADMAP SAVE ERROR:",
        roadmapError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Roadmap generated but could not be saved.",
        },
        {
          status: 500,
        }
      );
    }

    // ACTIVITY
    const {
      error: activityError,
    } = await supabase
      .from("activities")
      .insert({
        user_id: user.id,
        action:
          `Generated Career Roadmap - ${targetRole}`,
      });

    if (activityError) {
      console.log(
        "CAREER ROADMAP ACTIVITY ERROR:",
        activityError
      );
    }

    return NextResponse.json({
      success: true,

      roadmap,

      savedRoadmap,

      profile: {
        targetRole,
        skills,
        readiness,
      },
    });
  } catch (error: unknown) {
    console.log(
      "CAREER ROADMAP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Career roadmap generation failed",
      },
      {
        status: 500,
      }
    );
  }
}