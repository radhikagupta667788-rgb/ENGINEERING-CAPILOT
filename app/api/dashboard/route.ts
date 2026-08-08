import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
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
      createServerSupabase();

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
        "Progress error:",
        progressError
      );
    }

    const {
      data: activities,
      error: activityError,
    } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (activityError) {
      console.log(
        "Activity error:",
        activityError
      );
    }

    return NextResponse.json({
      success: true,

      stats: {
        streak:
          progress?.streak ?? 0,

        coding:
          progress?.coding_count ?? 0,

        aiChats:
          progress?.ai_chats ?? 0,

        resumeScore:
          progress?.resume_score ?? 0,
      },

      activities:
        activities || [],
    });
  } catch (error: any) {
    console.log(
      "Dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Dashboard failed",
      },
      {
        status: 500,
      }
    );
  }
}