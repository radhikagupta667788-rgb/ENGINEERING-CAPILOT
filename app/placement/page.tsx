"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import CompanyRoadmap from "@/components/placement/CompanyRoadmap";

type PlacementProgress = {
  dsa: number;
  sql_progress: number;
  core_cs: number;
  aptitude: number;
  projects: number;
};

export default function PlacementPage() {
  const [progress, setProgress] =
    useState<PlacementProgress>({
      dsa: 0,
      sql_progress: 0,
      core_cs: 0,
      aptitude: 0,
      projects: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("placement_progress")
        .select(
          "dsa,sql_progress,core_cs,aptitude,projects"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log(
          "PLACEMENT LOAD ERROR:",
          error
        );

        setMessage(error.message);
        return;
      }

      if (data) {
        setProgress({
          dsa:
            data.dsa ?? 0,

          sql_progress:
            data.sql_progress ?? 0,

          core_cs:
            data.core_cs ?? 0,

          aptitude:
            data.aptitude ?? 0,

          projects:
            data.projects ?? 0,
        });
      }
    } catch (error) {
      console.log(
        "PLACEMENT LOAD FAILED:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load placement progress."
      );
    } finally {
      setLoading(false);
    }
  }

  const readiness =
    useMemo(() => {
      return Math.round(
        (
          progress.dsa +
          progress.sql_progress +
          progress.core_cs +
          progress.aptitude +
          progress.projects
        ) / 5
      );
    }, [progress]);

  function updateValue(
    key: keyof PlacementProgress,
    value: number
  ) {
    setProgress(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );

    setMessage("");
  }

  async function saveProgress() {
    if (saving) return;

    try {
      setSaving(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const {
        error,
      } = await supabase
        .from("placement_progress")
        .upsert(
          {
            user_id:
              user.id,

            dsa:
              progress.dsa,

            sql_progress:
              progress.sql_progress,

            core_cs:
              progress.core_cs,

            aptitude:
              progress.aptitude,

            projects:
              progress.projects,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "user_id",
          }
        );

      if (error) {
        throw error;
      }

      const {
        error: activityError,
      } = await supabase
        .from("activities")
        .insert({
          user_id:
            user.id,

          action:
            `Updated Placement Progress - ${readiness}% Ready`,
        });

      if (activityError) {
        console.log(
          "PLACEMENT ACTIVITY ERROR:",
          activityError
        );
      }

      setMessage(
        "Placement progress saved successfully."
      );
    } catch (error) {
      console.log(
        "PLACEMENT SAVE ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Progress save failed."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">

      {/* HEADER */}
      <section className="signal-panel relative overflow-hidden rounded-[30px] p-7 md:p-9">

        <div className="relative z-10 max-w-3xl">

          <div className="system-label">
            <span className="signal-dot" />
            Placement Command Online
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
            Placement Command
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#5cf2d6]/60">
            Career Readiness Control Center
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/50">
            Track DSA, SQL, Core CS, aptitude,
            projects and company-specific preparation
            from one intelligent placement workspace.
          </p>

        </div>

        <div className="absolute right-8 top-8 hidden xl:block">

          <div className="rounded-2xl border border-emerald-300/10 bg-black/10 p-5 font-mono text-[10px] text-emerald-100/35">

            <p>
              MODULE: PLACEMENT_COMMAND
            </p>

            <p className="mt-2">
              MODE: CAREER_READINESS
            </p>

            <p className="mt-2">
              TARGET: SOFTWARE_ENGINEERING
            </p>

            <p className="mt-2 text-lime-300">
              STATUS: ONLINE
            </p>

          </div>

        </div>

      </section>

      {/* READINESS + SKILLS */}
      <section className="grid gap-5 xl:grid-cols-3">

        {/* OVERALL READINESS */}
        <div className="command-panel rounded-3xl p-6">

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Placement Telemetry
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Overall Readiness
          </h2>

          <div className="mt-7 flex justify-center">

            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-[#5cf2d6]/20">

              <div
                className="absolute inset-3 rounded-full"
                style={{
                  background: `conic-gradient(
                    #5cf2d6 ${
                      readiness * 3.6
                    }deg,
                    rgba(92,242,214,0.08) 0deg
                  )`,
                }}
              />

              <div className="absolute inset-6 rounded-full bg-[#091512]" />

              <div className="relative text-center">

                <p className="font-mono text-4xl font-bold text-[#5cf2d6]">
                  {loading
                    ? "--"
                    : `${readiness}%`}
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-emerald-100/30">
                  Placement Ready
                </p>

              </div>

            </div>

          </div>

          <p className="mt-6 text-center text-xs leading-6 text-emerald-50/35">
            Readiness is calculated from DSA, SQL,
            Core CS, Aptitude and Projects.
          </p>

        </div>

        {/* SKILL CONTROLS */}
        <div className="command-panel rounded-3xl p-6 xl:col-span-2">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                Preparation Matrix
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Skill Progress
              </h2>

            </div>

            <span className="rounded-full border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 px-3 py-2 font-mono text-[9px] text-[#5cf2d6]">
              {readiness}% READY
            </span>

          </div>

          <div className="mt-7 space-y-6">

            <ProgressControl
              label="DSA"
              value={
                progress.dsa
              }
              onChange={(value) =>
                updateValue(
                  "dsa",
                  value
                )
              }
            />

            <ProgressControl
              label="SQL"
              value={
                progress.sql_progress
              }
              onChange={(value) =>
                updateValue(
                  "sql_progress",
                  value
                )
              }
            />

            <ProgressControl
              label="Core CS"
              value={
                progress.core_cs
              }
              onChange={(value) =>
                updateValue(
                  "core_cs",
                  value
                )
              }
            />

            <ProgressControl
              label="Aptitude"
              value={
                progress.aptitude
              }
              onChange={(value) =>
                updateValue(
                  "aptitude",
                  value
                )
              }
            />

            <ProgressControl
              label="Projects"
              value={
                progress.projects
              }
              onChange={(value) =>
                updateValue(
                  "projects",
                  value
                )
              }
            />

          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">

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
                ? "SAVING PROGRESS..."
                : "SAVE PLACEMENT PROGRESS →"}
            </button>

            {message && (
              <span className="text-xs text-lime-200">
                {message}
              </span>
            )}

          </div>

        </div>

      </section>

      {/* SNAPSHOT */}
      <section className="command-panel rounded-3xl p-6">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
              Readiness Breakdown
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Placement Snapshot
            </h2>

          </div>

          <div className="flex items-center gap-2">

            <span className="signal-dot" />

            <span className="font-mono text-[9px] text-lime-200">
              LIVE PROGRESS
            </span>

          </div>

        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

          <MiniCard
            title="DSA"
            value={
              progress.dsa
            }
          />

          <MiniCard
            title="SQL"
            value={
              progress.sql_progress
            }
          />

          <MiniCard
            title="Core CS"
            value={
              progress.core_cs
            }
          />

          <MiniCard
            title="Aptitude"
            value={
              progress.aptitude
            }
          />

          <MiniCard
            title="Projects"
            value={
              progress.projects
            }
          />

        </div>

      </section>

      {/* COMPANY ROADMAP */}
      <section>
        <CompanyRoadmap />
      </section>

    </div>
  );
}

function ProgressControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-semibold text-white">
          {label}
        </span>

        <span className="font-mono text-xs text-[#5cf2d6]">
          {value}%
        </span>

      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={
          value
        }
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-[#5cf2d6]"
      />

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-emerald-300/10">

        <div
          className="h-full rounded-full bg-gradient-to-r from-[#5cf2d6] to-[#c8ff5c] transition-all duration-300"
          style={{
            width:
              `${value}%`,
          }}
        />

      </div>

    </div>
  );
}

function MiniCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.025] p-4 transition hover:border-[#5cf2d6]/20">

      <div className="flex items-center justify-between">

        <span className="text-xs text-emerald-50/40">
          {title}
        </span>

        <span className="font-mono text-xs font-bold text-[#5cf2d6]">
          {value}%
        </span>

      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-300/10">

        <div
          className="h-full rounded-full bg-gradient-to-r from-[#5cf2d6] to-[#c8ff5c] transition-all duration-300"
          style={{
            width:
              `${value}%`,
          }}
        />

      </div>

    </div>
  );
}