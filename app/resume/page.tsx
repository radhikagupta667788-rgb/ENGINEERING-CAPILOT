import ResumeAnalyzer from "@/components/resume/ResumeAnalyzer";

export default function ResumePage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="signal-panel relative overflow-hidden rounded-[30px] p-7 md:p-9">
        <div className="relative z-10 max-w-3xl">
          <div className="system-label">
            <span className="signal-dot"></span>
            Career Scanner Ready
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
            Career Scanner
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#5cf2d6]/60">
            AI Resume Intelligence
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/50">
            Upload your resume and let the AI inspect ATS readiness,
            technical skills, missing keywords, strengths and areas
            that need improvement.
          </p>
        </div>

        <div className="absolute right-8 top-8 hidden xl:block">
          <div className="rounded-2xl border border-emerald-300/10 bg-black/10 p-5 font-mono text-[10px] text-emerald-100/35">
            <p>MODULE: CAREER_SCANNER</p>
            <p className="mt-2">INPUT: RESUME_PDF</p>
            <p className="mt-2">ENGINE: ATS_INTELLIGENCE</p>
            <p className="mt-2 text-lime-300">
              STATUS: READY
            </p>
          </div>
        </div>
      </section>

      {/* SCANNER FEATURES */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <ScanFeature
          code="SCAN-01"
          title="ATS Score"
          text="Measure resume compatibility"
        />

        <ScanFeature
          code="SCAN-02"
          title="Skill Mapping"
          text="Detect technical strengths"
        />

        <ScanFeature
          code="SCAN-03"
          title="Keyword Gap"
          text="Find missing recruiter keywords"
        />

        <ScanFeature
          code="SCAN-04"
          title="Improvement Plan"
          text="Generate actionable suggestions"
        />

      </section>

      {/* RESUME ANALYZER */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
              Analysis Workspace
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              Resume Intelligence Console
            </h2>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="signal-dot"></span>

            <span className="font-mono text-[10px] text-lime-200">
              SCANNER ONLINE
            </span>
          </div>
        </div>

        <div className="command-panel overflow-hidden rounded-[28px]">
          <ResumeAnalyzer />
        </div>
      </section>

    </div>
  );
}

function ScanFeature({
  code,
  title,
  text,
}: {
  code: string;
  title: string;
  text: string;
}) {
  return (
    <div className="command-panel system-card rounded-2xl p-4">

      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-emerald-200/30">
          {code}
        </span>

        <span className="h-2 w-2 rounded-full bg-[#5cf2d6] shadow-[0_0_10px_rgba(92,242,214,0.7)]"></span>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-emerald-50/35">
        {text}
      </p>

    </div>
  );
}
