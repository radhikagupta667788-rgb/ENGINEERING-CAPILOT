"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";

type ResumeResult = {
  score: number;
  summary: string;
  strengths?: string[];
  missingSkills?: string[];
  improvements?: string[];
};

export default function ResumeAnalyzer() {
  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<ResumeResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function analyzeResume() {
    if (!file) {
      setError(
        "Please upload your resume first."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      // =========================
      // CURRENT SESSION
      // =========================

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "Please login first."
        );
        return;
      }

      // =========================
      // FORM DATA
      // =========================

      const formData =
        new FormData();

      formData.append(
        "resume",
        file
      );

      // =========================
      // API CALL
      // =========================

      const response =
        await fetch(
          "/api/resume",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: formData,
          }
        );

      // IMPORTANT:
      // Pehle response.json() direct tha.
      // Ab pehle text read karenge.

      const responseText =
        await response.text();

      let data: any;

      try {
        data =
          JSON.parse(
            responseText
          );
      } catch {
        console.log(
          "RAW RESUME API RESPONSE:",
          responseText
        );

        throw new Error(
          responseText ||
            "Server returned an invalid response."
        );
      }

      // =========================
      // ERROR RESPONSE
      // =========================

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Resume analysis failed"
        );
      }

      // =========================
      // SUCCESS
      // =========================

      if (
        data.success &&
        data.result
      ) {
        setResult(
          data.result
        );
      } else {
        setError(
          data.error ||
            "Analysis failed"
        );
      }

    } catch (error) {
      console.log(
        "RESUME ANALYZER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================
  // DOWNLOAD REPORT
  // =========================

  function downloadReport() {
    if (!result) return;

    const pdf =
      new jsPDF();

    pdf.setFontSize(20);

    pdf.text(
      "AI Resume ATS Report",
      20,
      20
    );

    pdf.setFontSize(14);

    pdf.text(
      `ATS Score: ${result.score}%`,
      20,
      40
    );

    pdf.text(
      "Summary:",
      20,
      60
    );

    const summaryLines =
      pdf.splitTextToSize(
        String(
          result.summary || ""
        ),
        170
      );

    pdf.text(
      summaryLines,
      20,
      72
    );

    let y =
      72 +
      summaryLines.length * 7 +
      12;

    const addSection = (
      title: string,
      items?: string[]
    ) => {
      if (!items?.length) {
        return;
      }

      if (y > 260) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(14);

      pdf.text(
        title,
        20,
        y
      );

      y += 10;

      pdf.setFontSize(11);

      items.forEach(
        (item) => {
          const lines =
            pdf.splitTextToSize(
              `• ${item}`,
              165
            );

          if (
            y +
              lines.length *
                6 >
            280
          ) {
            pdf.addPage();
            y = 20;
          }

          pdf.text(
            lines,
            25,
            y
          );

          y +=
            lines.length *
              6 +
            3;
        }
      );

      y += 8;
    };

    addSection(
      "Strengths:",
      result.strengths
    );

    addSection(
      "Missing Skills:",
      result.missingSkills
    );

    addSection(
      "Improvements:",
      result.improvements
    );

    pdf.save(
      "ATS-Resume-Report.pdf"
    );
  }

  return (
    <div className="bg-[#091512] p-5 md:p-7">

      {/* TOP STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-300/10 pb-5">

        <div>

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Scanner Console
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Resume Intelligence Engine
          </h2>

        </div>

        <div className="flex items-center gap-2">

          <span className="signal-dot"></span>

          <span className="font-mono text-[9px] text-lime-200">
            READY FOR INPUT
          </span>

        </div>

      </div>

      {/* UPLOAD AREA */}
      <div className="mt-6 rounded-3xl border border-dashed border-[#5cf2d6]/20 bg-[#5cf2d6]/[0.025] p-8 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">

          <span className="font-mono text-lg font-bold text-[#5cf2d6]">
            PDF
          </span>

        </div>

        <h3 className="mt-5 text-base font-semibold text-white">
          Upload Resume
        </h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-emerald-50/35">
          Upload your resume PDF and run the AI-powered
          Career Scanner.
        </p>

        <label className="ghost-button mt-5 inline-flex cursor-pointer rounded-xl px-5 py-3 text-xs font-semibold">

          Select Resume PDF

          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              setFile(
                e.target.files?.[0] ||
                  null
              );

              setError("");
              setResult(null);
            }}
          />

        </label>

        {/* SELECTED FILE */}
        {file && (
          <div className="mx-auto mt-5 flex max-w-lg items-center justify-between gap-4 rounded-2xl border border-lime-300/10 bg-lime-300/[0.04] px-4 py-3 text-left">

            <div className="min-w-0">

              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-lime-200/60">
                File Loaded
              </p>

              <p className="mt-1 truncate text-xs text-emerald-50/60">
                {file.name}
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
                setError("");
              }}
              className="text-xs font-semibold text-lime-200"
            >
              REMOVE
            </button>

          </div>
        )}

        <button
          onClick={
            analyzeResume
          }
          disabled={
            loading ||
            !file
          }
          className="signal-button mt-6 rounded-xl px-7 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "SCANNING RESUME..."
            : "START CAREER SCAN →"}
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-5 rounded-2xl border border-red-400/15 bg-red-400/5 p-4">

          <p className="whitespace-pre-wrap text-sm leading-6 text-red-300">
            {error}
          </p>

        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="command-panel mt-6 rounded-3xl p-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">

            <div className="flex gap-1">

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6]"></span>

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6] [animation-delay:150ms]"></span>

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#c8ff5c] [animation-delay:300ms]"></span>

            </div>

          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100/35">
            Running ATS intelligence scan...
          </p>

        </div>
      )}

      {/* RESULT */}
      {result &&
        !loading && (
          <div className="mt-7 space-y-5">

            <div className="grid gap-5 xl:grid-cols-3">

              {/* SCORE */}
              <div className="command-panel rounded-3xl p-6">

                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                  ATS Signal
                </p>

                <div className="mt-6 flex justify-center">

                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-[#5cf2d6]/20">

                    <div
                      className="absolute inset-3 rounded-full"
                      style={{
                        background: `conic-gradient(
                          #5cf2d6 ${
                            Math.min(
                              Math.max(
                                result.score,
                                0
                              ),
                              100
                            ) * 3.6
                          }deg,
                          rgba(92,242,214,0.08) 0deg
                        )`,
                      }}
                    />

                    <div className="absolute inset-6 rounded-full bg-[#091512]" />

                    <div className="relative text-center">

                      <p className="font-mono text-4xl font-bold text-[#5cf2d6]">
                        {result.score}%
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-emerald-100/30">
                        Compatibility
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* SUMMARY */}
              <div className="command-panel rounded-3xl p-6 xl:col-span-2">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                      Executive Analysis
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                      Resume Summary
                    </h3>

                  </div>

                  <button
                    onClick={
                      downloadReport
                    }
                    className="signal-button rounded-xl px-5 py-2.5 text-xs font-bold"
                  >
                    DOWNLOAD REPORT
                  </button>

                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-emerald-50/60">
                  {result.summary}
                </p>

              </div>

            </div>

            {/* RESULT CARDS */}
            <div className="grid gap-5 lg:grid-cols-3">

              <ResultCard
                code="R-01"
                title="Strengths"
                items={
                  result.strengths
                }
                color="#c8ff5c"
              />

              <ResultCard
                code="R-02"
                title="Missing Skills"
                items={
                  result.missingSkills
                }
                color="#ffc857"
              />

              <ResultCard
                code="R-03"
                title="Improvements"
                items={
                  result.improvements
                }
                color="#5cf2d6"
              />

            </div>

          </div>
        )}

    </div>
  );
}

function ResultCard({
  code,
  title,
  items,
  color,
}: {
  code: string;
  title: string;
  items?: string[];
  color: string;
}) {
  return (
    <div className="command-panel rounded-3xl p-5">

      <div className="flex items-center justify-between">

        <span className="font-mono text-[9px] text-emerald-100/30">
          {code}
        </span>

        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor:
              color,

            boxShadow:
              `0 0 12px ${color}`,
          }}
        />

      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        {title}
      </h3>

      <div className="mt-4 space-y-3">

        {items?.length ? (
          items.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.025] px-3 py-3"
              >

                <p className="text-xs leading-5 text-emerald-50/55">
                  {item}
                </p>

              </div>
            )
          )
        ) : (
          <p className="text-xs text-emerald-100/25">
            No data detected.
          </p>
        )}

      </div>

    </div>
  );
}