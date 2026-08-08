"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type RoadmapStep = {
  title: string;
  description: string;
  topics: string[];
};

type CompanyData = {
  name: string;
  role: string;
  color: string;
  roadmap: RoadmapStep[];
};

const companies: CompanyData[] = [
  {
    name: "Amazon",
    role: "Software Development Engineer",
    color: "#ffb84d",
    roadmap: [
      {
        title: "DSA Foundation",
        description:
          "Build strong problem-solving fundamentals.",
        topics: [
          "Arrays & Strings",
          "Hashing",
          "Linked Lists",
          "Stacks & Queues",
          "Recursion",
          "Binary Search",
        ],
      },
      {
        title: "Advanced DSA",
        description:
          "Prepare important interview-level patterns.",
        topics: [
          "Trees & BST",
          "Graphs",
          "Heaps",
          "Greedy",
          "Dynamic Programming",
          "Sliding Window",
        ],
      },
      {
        title: "Core CS",
        description:
          "Strengthen computer science fundamentals.",
        topics: [
          "DBMS",
          "Operating Systems",
          "Computer Networks",
          "OOP",
          "SQL",
        ],
      },
      {
        title: "Projects",
        description:
          "Prepare projects for technical discussion.",
        topics: [
          "Full Stack Project",
          "REST APIs",
          "Database Design",
          "Authentication",
          "Deployment",
        ],
      },
      {
        title: "Interview",
        description:
          "Prepare for coding and behavioral rounds.",
        topics: [
          "Coding Practice",
          "Project Explanation",
          "Behavioral Questions",
          "STAR Method",
          "Mock Interviews",
        ],
      },
    ],
  },

  {
    name: "Google",
    role: "Software Engineer",
    color: "#5cf2d6",
    roadmap: [
      {
        title: "Problem Solving",
        description:
          "Develop strong algorithmic thinking.",
        topics: [
          "Arrays",
          "Strings",
          "Hash Maps",
          "Two Pointers",
          "Binary Search",
          "Recursion",
        ],
      },
      {
        title: "Advanced Algorithms",
        description:
          "Practice harder algorithmic concepts.",
        topics: [
          "Trees",
          "Graphs",
          "Dynamic Programming",
          "Greedy",
          "Backtracking",
          "Heaps",
        ],
      },
      {
        title: "Computer Science",
        description:
          "Prepare important CS fundamentals.",
        topics: [
          "Operating Systems",
          "DBMS",
          "Computer Networks",
          "OOP",
          "SQL",
        ],
      },
      {
        title: "Engineering Skills",
        description:
          "Build strong software engineering projects.",
        topics: [
          "Clean Code",
          "Git",
          "APIs",
          "Databases",
          "Testing",
          "Deployment",
        ],
      },
      {
        title: "Interview Practice",
        description:
          "Practice explaining solutions clearly.",
        topics: [
          "Coding Interviews",
          "Think Aloud Practice",
          "Complexity Analysis",
          "Mock Interviews",
          "Project Discussion",
        ],
      },
    ],
  },

  {
    name: "Microsoft",
    role: "Software Engineer",
    color: "#7dd3fc",
    roadmap: [
      {
        title: "Coding Foundation",
        description:
          "Master common coding interview topics.",
        topics: [
          "Arrays",
          "Strings",
          "Linked Lists",
          "Stacks",
          "Queues",
          "Binary Search",
        ],
      },
      {
        title: "DSA Mastery",
        description:
          "Move into intermediate and advanced DSA.",
        topics: [
          "Trees",
          "Graphs",
          "Dynamic Programming",
          "Recursion",
          "Backtracking",
          "Heaps",
        ],
      },
      {
        title: "CS Fundamentals",
        description:
          "Prepare technical fundamentals.",
        topics: [
          "OOP",
          "DBMS",
          "Operating Systems",
          "Networks",
          "SQL",
        ],
      },
      {
        title: "Development",
        description:
          "Build practical development experience.",
        topics: [
          "Frontend",
          "Backend",
          "REST API",
          "Database",
          "Git",
          "Deployment",
        ],
      },
      {
        title: "Final Preparation",
        description:
          "Prepare for technical and HR discussions.",
        topics: [
          "Coding Rounds",
          "Resume Questions",
          "Projects",
          "Behavioral Questions",
          "Mock Interview",
        ],
      },
    ],
  },
];

export default function CompanyRoadmap() {
  const [selectedCompany, setSelectedCompany] =
    useState("Amazon");

  const [completedTopics, setCompletedTopics] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const company =
    companies.find(
      (item) =>
        item.name === selectedCompany
    ) || companies[0];

  // =========================
  // ALL TOPICS
  // =========================

  const allTopics = useMemo(() => {
    return company.roadmap.flatMap(
      (step) =>
        step.topics.map(
          (topic) =>
            `${step.title}::${topic}`
        )
    );
  }, [company]);

  // =========================
  // PROGRESS
  // =========================

  const progressPercent =
    useMemo(() => {
      if (
        allTopics.length === 0
      ) {
        return 0;
      }

      const validCompleted =
        completedTopics.filter(
          (topic) =>
            allTopics.includes(
              topic
            )
        );

      return Math.round(
        (validCompleted.length /
          allTopics.length) *
          100
      );
    }, [
      completedTopics,
      allTopics,
    ]);

  // =========================
  // LOAD COMPANY
  // =========================

  useEffect(() => {
    loadCompanyProgress();
  }, [selectedCompany]);

  async function loadCompanyProgress() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        setCompletedTopics(
          []
        );

        setMessage(
          "Please login first."
        );

        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "company_roadmap_progress"
        )
        .select(
          "completed_topics, progress_percent"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "company",
          selectedCompany
        )
        .maybeSingle();

      if (error) {
        console.log(
          "ROADMAP LOAD ERROR:",
          error
        );

        setCompletedTopics(
          []
        );

        setMessage(
          error.message
        );

        return;
      }

      if (
        data &&
        Array.isArray(
          data.completed_topics
        )
      ) {
        setCompletedTopics(
          data.completed_topics
        );
      } else {
        setCompletedTopics(
          []
        );
      }
    } catch (error) {
      console.log(
        "ROADMAP LOAD FAILED:",
        error
      );

      setCompletedTopics(
        []
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load roadmap progress."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // CHANGE COMPANY
  // =========================

  function changeCompany(
    companyName: string
  ) {
    if (
      companyName ===
      selectedCompany
    ) {
      return;
    }

    setSelectedCompany(
      companyName
    );

    setCompletedTopics(
      []
    );

    setMessage("");
  }

  // =========================
  // TOGGLE TOPIC
  // =========================

  function toggleTopic(
    stepTitle: string,
    topic: string
  ) {
    if (
      loading ||
      saving
    ) {
      return;
    }

    const key =
      `${stepTitle}::${topic}`;

    setCompletedTopics(
      (previous) => {
        if (
          previous.includes(
            key
          )
        ) {
          return previous.filter(
            (item) =>
              item !== key
          );
        }

        return [
          ...previous,
          key,
        ];
      }
    );

    setMessage("");
  }

  // =========================
  // CHECK TOPIC
  // =========================

  function isCompleted(
    stepTitle: string,
    topic: string
  ) {
    return completedTopics.includes(
      `${stepTitle}::${topic}`
    );
  }

  // =========================
  // SAVE
  // =========================

  async function saveProgress() {
    // prevents repeated save
    if (
      saving ||
      loading
    ) {
      return;
    }

    try {
      setSaving(true);

      // remove previous message
      setMessage("");

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        setMessage(
          "Please login first."
        );

        return;
      }

      // Keep only topics that
      // actually belong to current company.
      const validCompletedTopics =
        completedTopics.filter(
          (topic) =>
            allTopics.includes(
              topic
            )
        );

      const finalProgress =
        allTopics.length > 0
          ? Math.round(
              (
                validCompletedTopics.length /
                allTopics.length
              ) * 100
            )
          : 0;

      // UPSERT = insert first time,
      // update next time.
      const {
        error: saveError,
      } = await supabase
        .from(
          "company_roadmap_progress"
        )
        .upsert(
          {
            user_id:
              user.id,

            company:
              selectedCompany,

            completed_topics:
              validCompletedTopics,

            progress_percent:
              finalProgress,

            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict:
              "user_id,company",
          }
        );

      if (saveError) {
        throw saveError;
      }

      // =========================
      // ACTIVITY
      // =========================

      const {
        error: activityError,
      } = await supabase
        .from("activities")
        .insert({
          user_id:
            user.id,

          action:
            `${selectedCompany} Roadmap - ${finalProgress}% Complete`,
        });

      if (
        activityError
      ) {
        console.log(
          "ROADMAP ACTIVITY ERROR:",
          activityError
        );
      }

      // ONE success message only
      setMessage(
        `${selectedCompany} roadmap progress saved.`
      );
    } catch (error) {
      console.log(
        "ROADMAP SAVE ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Roadmap save failed."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="command-panel rounded-3xl p-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Target Protocol
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Company Roadmap
          </h2>

          <p className="mt-2 text-xs text-emerald-50/35">
            Track company-specific preparation
            and save your progress.
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="signal-dot" />

          <span className="font-mono text-[9px] text-lime-200">
            ROADMAP TRACKER ONLINE
          </span>

        </div>

      </div>

      {/* ================= COMPANY BUTTONS ================= */}

      <div className="mt-6 flex flex-wrap gap-3">

        {companies.map(
          (item) => (
            <button
              key={
                item.name
              }
              type="button"
              disabled={
                loading ||
                saving
              }
              onClick={() =>
                changeCompany(
                  item.name
                )
              }
              className={`rounded-xl px-5 py-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selectedCompany ===
                item.name
                  ? "signal-button"
                  : "ghost-button"
              }`}
            >
              {item.name}
            </button>
          )
        )}

      </div>

      {/* ================= COMPANY STATUS ================= */}

      <div className="mt-7 grid gap-4 lg:grid-cols-3">

        {/* TARGET */}

        <div className="rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.025] p-6 lg:col-span-2">

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Target Company
          </p>

          <h3
            className="mt-2 text-2xl font-bold"
            style={{
              color:
                company.color,
            }}
          >
            {company.name}
          </h3>

          <p className="mt-1 text-xs text-emerald-50/40">
            {company.role}
          </p>

          <div className="mt-5 flex flex-wrap gap-8">

            <div>

              <p className="font-mono text-xl font-bold text-white">
                {
                  company
                    .roadmap
                    .length
                }
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-emerald-100/30">
                Stages
              </p>

            </div>

            <div>

              <p className="font-mono text-xl font-bold text-white">
                {
                  completedTopics
                    .filter(
                      (
                        topic
                      ) =>
                        allTopics.includes(
                          topic
                        )
                    )
                    .length
                }
                /
                {
                  allTopics.length
                }
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-emerald-100/30">
                Topics Done
              </p>

            </div>

          </div>

        </div>

        {/* READINESS */}

        <div className="rounded-3xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/[0.035] p-6">

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#5cf2d6]/45">
            Company Readiness
          </p>

          <p className="mt-4 font-mono text-4xl font-bold text-[#5cf2d6]">
            {loading
              ? "--"
              : `${progressPercent}%`}
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/20">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5cf2d6] to-[#c8ff5c] transition-all duration-300"
              style={{
                width:
                  `${progressPercent}%`,
              }}
            />

          </div>

          <p className="mt-3 text-[10px] text-emerald-50/35">
            {
              completedTopics.filter(
                (
                  topic
                ) =>
                  allTopics.includes(
                    topic
                  )
              ).length
            }{" "}
            of{" "}
            {
              allTopics.length
            }{" "}
            topics completed
          </p>

        </div>

      </div>

      {/* ================= ROADMAP ================= */}

      <div className="mt-7 space-y-4">

        {company.roadmap.map(
          (
            step,
            index
          ) => {
            const completedInStage =
              step.topics.filter(
                (
                  topic
                ) =>
                  isCompleted(
                    step.title,
                    topic
                  )
              ).length;

            const stagePercent =
              step.topics.length >
              0
                ? Math.round(
                    (
                      completedInStage /
                      step
                        .topics
                        .length
                    ) *
                      100
                  )
                : 0;

            return (
              <div
                key={
                  step.title
                }
                className="rounded-3xl border border-emerald-300/10 bg-[#071512] p-5 transition hover:border-[#5cf2d6]/20"
              >

                <div className="flex gap-5">

                  {/* NUMBER */}

                  <div className="flex-shrink-0">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 font-mono text-xs font-bold text-[#5cf2d6]">

                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div>

                        <h4 className="text-sm font-semibold text-white">
                          {
                            step.title
                          }
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-emerald-50/35">
                          {
                            step.description
                          }
                        </p>

                      </div>

                      <span className="font-mono text-[9px] text-[#5cf2d6]">
                        {
                          stagePercent
                        }
                        %
                      </span>

                    </div>

                    {/* STAGE BAR */}

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-300/10">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#5cf2d6] to-[#c8ff5c] transition-all duration-300"
                        style={{
                          width:
                            `${stagePercent}%`,
                        }}
                      />

                    </div>

                    {/* TOPICS */}

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">

                      {step.topics.map(
                        (
                          topic
                        ) => {
                          const done =
                            isCompleted(
                              step.title,
                              topic
                            );

                          return (
                            <button
                              key={
                                topic
                              }
                              type="button"
                              disabled={
                                loading ||
                                saving
                              }
                              onClick={() =>
                                toggleTopic(
                                  step.title,
                                  topic
                                )
                              }
                              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                done
                                  ? "border-lime-300/20 bg-lime-300/[0.07]"
                                  : "border-emerald-300/10 bg-emerald-300/[0.025] hover:border-[#5cf2d6]/20"
                              }`}
                            >

                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] ${
                                  done
                                    ? "border-lime-300/40 bg-lime-300/15 text-lime-200"
                                    : "border-emerald-300/20 text-transparent"
                                }`}
                              >
                                ✓
                              </span>

                              <span
                                className={`text-xs ${
                                  done
                                    ? "text-lime-100"
                                    : "text-emerald-50/50"
                                }`}
                              >
                                {
                                  topic
                                }
                              </span>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ================= SAVE ================= */}

      <div className="mt-7 border-t border-emerald-300/10 pt-6">

        <div className="flex flex-wrap items-center gap-4">

          <button
            type="button"
            onClick={
              saveProgress
            }
            disabled={
              saving ||
              loading
            }
            className="signal-button rounded-xl px-7 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "SAVING ROADMAP..."
              : `SAVE ${selectedCompany.toUpperCase()} ROADMAP →`}
          </button>

          {/* SUCCESS/ERROR MESSAGE ONLY ONCE */}

          {message && (
            <span className="text-xs text-lime-200">
              {message}
            </span>
          )}

        </div>

      </div>

    </div>
  );
}