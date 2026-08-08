"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  streak: number;
  coding: number;
  aiChats: number;
  resumeScore: number;
  placementReadiness: number;
};

type Activity = {
  id: string | number;
  action: string;
};

type CompanyRoadmapStats = {
  company: string;
  progress: number;
  completedTopics: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    streak: 0,
    coding: 0,
    aiChats: 0,
    resumeScore: 0,
    placementReadiness: 0,
  });

  const [companyRoadmap, setCompanyRoadmap] =
    useState<CompanyRoadmapStats>({
      company: "Not Selected",
      progress: 0,
      completedTopics: 0,
    });

  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // =========================
      // CURRENT USER
      // =========================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.log(
          "USER ERROR:",
          userError
        );
      }

      if (!user) {
        return;
      }

      // =========================
      // MAIN PROGRESS
      // =========================

      const {
        data: progress,
        error: progressError,
      } = await supabase
        .from("progress")
        .select("*")
        .eq("userid", user.id)
        .maybeSingle();

      if (progressError) {
        console.log(
          "PROGRESS ERROR:",
          progressError
        );
      }

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      let streak = 1;
      let coding = 0;
      let aiChats = 0;
      let resumeScore = 0;

      // =========================
      // CREATE FIRST PROGRESS ROW
      // =========================

      if (!progress) {
        const {
          data: newProgress,
          error: insertError,
        } = await supabase
          .from("progress")
          .insert({
            userid:
              user.id,

            streak:
              1,

            coding_count:
              0,

            ai_chats:
              0,

            resume_score:
              0,

            last_active_date:
              today,
          })
          .select()
          .single();

        if (insertError) {
          console.log(
            "PROGRESS INSERT ERROR:",
            insertError
          );
        }

        if (newProgress) {
          streak =
            newProgress.streak ??
            1;

          coding =
            newProgress.coding_count ??
            0;

          aiChats =
            newProgress.ai_chats ??
            0;

          resumeScore =
            newProgress.resume_score ??
            0;
        }
      } else {
        coding =
          progress.coding_count ??
          0;

        aiChats =
          progress.ai_chats ??
          0;

        resumeScore =
          progress.resume_score ??
          0;

        const oldStreak =
          progress.streak ??
          0;

        const lastActive =
          progress.last_active_date;

        // =========================
        // STREAK
        // =========================

        if (
          lastActive ===
          today
        ) {
          streak =
            oldStreak ||
            1;
        } else if (
          lastActive
        ) {
          const yesterday =
            new Date();

          yesterday.setDate(
            yesterday.getDate() -
              1
          );

          const yesterdayString =
            yesterday
              .toISOString()
              .split("T")[0];

          if (
            lastActive ===
            yesterdayString
          ) {
            streak =
              oldStreak +
              1;
          } else {
            streak = 1;
          }

          const {
            error,
          } = await supabase
            .from("progress")
            .update({
              streak,

              last_active_date:
                today,
            })
            .eq(
              "userid",
              user.id
            );

          if (error) {
            console.log(
              "STREAK UPDATE ERROR:",
              error
            );
          }
        } else {
          streak =
            oldStreak >
            0
              ? oldStreak
              : 1;

          const {
            error,
          } = await supabase
            .from("progress")
            .update({
              streak,

              last_active_date:
                today,
            })
            .eq(
              "userid",
              user.id
            );

          if (error) {
            console.log(
              "DATE UPDATE ERROR:",
              error
            );
          }
        }
      }

      // =========================
      // PLACEMENT PROGRESS
      // =========================

      const {
        data: placement,
        error: placementError,
      } = await supabase
        .from(
          "placement_progress"
        )
        .select(
          "dsa,sql_progress,core_cs,aptitude,projects"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

      if (placementError) {
        console.log(
          "PLACEMENT ERROR:",
          placementError
        );
      }

      let placementReadiness =
        0;

      if (placement) {
        placementReadiness =
          Math.round(
            (
              (placement.dsa ??
                0) +
              (placement.sql_progress ??
                0) +
              (placement.core_cs ??
                0) +
              (placement.aptitude ??
                0) +
              (placement.projects ??
                0)
            ) / 5
          );
      }

      // =========================
      // COMPANY ROADMAP
      // =========================

      const {
        data: roadmapRows,
        error: roadmapError,
      } = await supabase
        .from(
          "company_roadmap_progress"
        )
        .select(
          "company,progress_percent,completed_topics,updated_at"
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "updated_at",
          {
            ascending:
              false,
          }
        )
        .limit(1);

      if (roadmapError) {
        console.log(
          "ROADMAP DASHBOARD ERROR:",
          roadmapError
        );
      }

      if (
        roadmapRows &&
        roadmapRows.length >
          0
      ) {
        const latestRoadmap =
          roadmapRows[0];

        setCompanyRoadmap({
          company:
            latestRoadmap.company ||
            "Not Selected",

          progress:
            latestRoadmap.progress_percent ??
            0,

          completedTopics:
            Array.isArray(
              latestRoadmap.completed_topics
            )
              ? latestRoadmap
                  .completed_topics
                  .length
              : 0,
        });
      } else {
        setCompanyRoadmap({
          company:
            "Not Selected",

          progress:
            0,

          completedTopics:
            0,
        });
      }

      // =========================
      // SET STATS
      // =========================

      setStats({
        streak,
        coding,
        aiChats,
        resumeScore,
        placementReadiness,
      });

      // =========================
      // ACTIVITIES
      // =========================

      const {
        data: activityData,
        error: activityError,
      } = await supabase
        .from("activities")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(5);

      if (activityError) {
        console.log(
          "ACTIVITY ERROR:",
          activityError
        );
      }

      setActivities(
        activityData ||
          []
      );
    } catch (error) {
      console.log(
        "DASHBOARD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // MODULES
  // =========================

  const modules = [
    {
      code: "SYS-01",
      title: "Neural Guide",
      subtitle: "AI Mentor",
      icon: "◈",
      description:
        "Ask engineering doubts and get guided explanations.",
      path: "/mentor",
      accent: "#38bdf8",
    },
    {
      code: "SYS-02",
      title: "Code Lab",
      subtitle:
        "Coding Assistant",
      icon: "</>",
      description:
        "Debug, review, explain and optimize your code.",
      path: "/coding",
      accent: "#60a5fa",
    },
    {
      code: "SYS-03",
      title:
        "Career Scanner",
      subtitle:
        "Resume Intelligence",
      icon: "◎",
      description:
        "Analyze ATS readiness and resume improvements.",
      path: "/resume",
      accent: "#818cf8",
    },
    {
      code: "SYS-04",
      title:
        "Simulation Room",
      subtitle:
        "AI Interview",
      icon: "◇",
      description:
        "Practice technical and HR interviews.",
      path: "/interview",
      accent: "#0ea5e9",
    },
    {
      code: "SYS-05",
      title:
        "Knowledge Deck",
      subtitle:
        "Smart Learning",
      icon: "▣",
      description:
        "Study PDFs and generate notes, quizzes and flashcards.",
      path: "/learning",
      accent: "#3b82f6",
    },
    {
      code: "SYS-06",
      title:
        "Placement Command",
      subtitle:
        "Placement Tracker",
      icon: "⌁",
      description:
        "Track skills, company roadmaps and placement readiness.",
      path: "/placement",
      accent: "#7dd3fc",
    },
  ];

  return (
    <div className="space-y-7">

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden rounded-[32px] border border-blue-400/15 bg-[#071525] p-7 md:p-10">

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-3 py-2">

            <span className="h-2 w-2 rounded-full bg-sky-400" />

            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">
              Command Center Active
            </span>

          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#dcecff] md:text-5xl">
            Engineering intelligence

            <span className="block bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              built into one workspace.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#819bbd]">
            Learn, code, analyze resumes, practice interviews
            and track your placement preparation.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <a
              href="/mentor"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-bold text-white"
            >
              Launch Neural Guide →
            </a>

            <a
              href="/placement"
              className="rounded-xl border border-blue-400/20 bg-[#0a1b31] px-5 py-3 text-sm font-semibold text-[#a9c3e4]"
            >
              Placement Command
            </a>

          </div>

        </div>

      </section>

      {/* ================= STATS ================= */}

      <section>

        <div className="mb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d7ea6]">
            Live Telemetry
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#d6e7fb]">
            Performance Signals
          </h2>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <MetricCard
            label="Learning Streak"
            value={
              loading
                ? "--"
                : `${stats.streak}D`
            }
            accent="#f59e0b"
            progress={
              Math.min(
                stats.streak *
                  10,
                100
              )
            }
            hint="Daily consistency"
          />

          <MetricCard
            label="Code Activity"
            value={
              loading
                ? "--"
                : String(
                    stats.coding
                  )
            }
            accent="#38bdf8"
            progress={
              Math.min(
                stats.coding *
                  10,
                100
              )
            }
            hint="Code Lab sessions"
          />

          <MetricCard
            label="AI Sessions"
            value={
              loading
                ? "--"
                : String(
                    stats.aiChats
                  )
            }
            accent="#60a5fa"
            progress={
              Math.min(
                stats.aiChats *
                  10,
                100
              )
            }
            hint="Mentor sessions"
          />

          <MetricCard
            label="ATS Score"
            value={
              loading
                ? "--"
                : `${stats.resumeScore}%`
            }
            accent="#818cf8"
            progress={
              stats.resumeScore
            }
            hint="Career Scanner"
          />

          <MetricCard
            label="Placement Ready"
            value={
              loading
                ? "--"
                : `${stats.placementReadiness}%`
            }
            accent="#7dd3fc"
            progress={
              stats.placementReadiness
            }
            hint="Overall preparation"
          />

        </div>

      </section>

      {/* ================= COMPANY TARGET ================= */}

      <section className="rounded-3xl border border-blue-400/12 bg-[#08172a] p-6">

        <div className="flex flex-wrap items-start justify-between gap-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d7ea6]">
              Target Intelligence
            </p>

            <h2 className="mt-2 text-lg font-semibold text-[#d6e7fb]">
              Company Roadmap Progress
            </h2>

            <p className="mt-2 text-xs text-[#637f9f]">
              Latest saved company preparation roadmap.
            </p>

          </div>

          <a
            href="/placement"
            className="rounded-xl border border-blue-400/15 bg-blue-500/[0.05] px-4 py-2 text-xs font-semibold text-sky-300"
          >
            OPEN ROADMAP →
          </a>

        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <CompanyMetric
            label="Target Company"
            value={
              loading
                ? "--"
                : companyRoadmap.company
            }
            accent="#38bdf8"
          />

          <CompanyMetric
            label="Roadmap Progress"
            value={
              loading
                ? "--"
                : `${companyRoadmap.progress}%`
            }
            accent="#c8ff5c"
          />

          <CompanyMetric
            label="Topics Completed"
            value={
              loading
                ? "--"
                : String(
                    companyRoadmap.completedTopics
                  )
            }
            accent="#818cf8"
          />

        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#040b15]">

          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-lime-300 transition-all duration-500"
            style={{
              width: `${
                loading
                  ? 0
                  : companyRoadmap.progress
              }%`,
            }}
          />

        </div>

      </section>

      {/* ================= MODULES ================= */}

      <section>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d7ea6]">
          Core Systems
        </p>

        <h2 className="mt-1 text-xl font-semibold text-[#d6e7fb]">
          AI Modules
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {modules.map(
            (module) => (
              <a
                key={
                  module.code
                }
                href={
                  module.path
                }
                className="group rounded-3xl border border-blue-400/12 bg-[#08172a] p-6 transition hover:-translate-y-1 hover:border-blue-400/30"
              >

                <div className="flex items-start gap-4">

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#06111f] font-mono"
                    style={{
                      color:
                        module.accent,

                      borderColor:
                        `${module.accent}40`,
                    }}
                  >
                    {
                      module.icon
                    }
                  </div>

                  <div>

                    <p className="font-mono text-[9px] text-[#557394]">
                      {
                        module.code
                      }
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-[#dcecff]">
                      {
                        module.title
                      }
                    </h3>

                    <p
                      className="mt-1 text-[10px] uppercase"
                      style={{
                        color:
                          module.accent,
                      }}
                    >
                      {
                        module.subtitle
                      }
                    </p>

                  </div>

                </div>

                <p className="mt-5 text-sm leading-6 text-[#7893b4]">
                  {
                    module.description
                  }
                </p>

              </a>
            )
          )}

        </div>

      </section>

      {/* ================= ACTIVITY ================= */}

      <section className="rounded-3xl border border-blue-400/12 bg-[#08172a] p-6">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d7ea6]">
              Activity Stream
            </p>

            <h2 className="mt-2 text-lg font-semibold text-[#d6e7fb]">
              Recent System Events
            </h2>

          </div>

          <span className="font-mono text-[9px] text-sky-300">
            LIVE
          </span>

        </div>

        <div className="mt-6 space-y-3">

          {loading ? (
            <ActivityItem
              text="Synchronizing workspace activity..."
              index={1}
            />
          ) : activities.length >
            0 ? (
            activities.map(
              (
                activity,
                index
              ) => (
                <ActivityItem
                  key={
                    activity.id
                  }
                  text={
                    activity.action
                  }
                  index={
                    index + 1
                  }
                />
              )
            )
          ) : (
            <ActivityItem
              text="No activity recorded yet."
              index={1}
            />
          )}

        </div>

      </section>

    </div>
  );
}

// =========================
// METRIC CARD
// =========================

function MetricCard({
  label,
  value,
  accent,
  progress,
  hint,
}: {
  label: string;
  value: string;
  accent: string;
  progress: number;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-blue-400/12 bg-[#08172a] p-5">

      <div className="flex items-center justify-between">

        <span className="text-[10px] uppercase tracking-[0.16em] text-[#637f9f]">
          {label}
        </span>

        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor:
              accent,

            boxShadow:
              `0 0 14px ${accent}`,
          }}
        />

      </div>

      <p className="mt-5 font-mono text-3xl font-bold text-[#dcecff]">
        {value}
      </p>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#040b15]">

        <div
          className="h-full rounded-full"
          style={{
            width:
              `${Math.max(
                4,
                Math.min(
                  progress,
                  100
                )
              )}%`,

            backgroundColor:
              accent,
          }}
        />

      </div>

      <p className="mt-3 text-[10px] text-[#506b89]">
        {hint}
      </p>

    </div>
  );
}

// =========================
// COMPANY METRIC
// =========================

function CompanyMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-400/10 bg-[#06111f] p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] uppercase tracking-[0.15em] text-[#557394]">
          {label}
        </p>

        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor:
              accent,

            boxShadow:
              `0 0 10px ${accent}`,
          }}
        />

      </div>

      <p
        className="mt-4 font-mono text-xl font-bold"
        style={{
          color:
            accent,
        }}
      >
        {value}
      </p>

    </div>
  );
}

// =========================
// ACTIVITY ITEM
// =========================

function ActivityItem({
  text,
  index,
}: {
  text: string;
  index: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-blue-400/10 bg-[#06111f] p-4">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/[0.05] font-mono text-[10px] text-sky-300">
        {String(
          index
        ).padStart(
          2,
          "0"
        )}
      </div>

      <p className="text-sm text-[#8ba5c4]">
        {text}
      </p>

    </div>
  );
}