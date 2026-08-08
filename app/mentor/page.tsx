import AIMentor from "@/components/mentor/AIMentor";

export default function MentorPage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="signal-panel relative overflow-hidden rounded-[30px] p-7 md:p-9">

        <div className="relative z-10 max-w-3xl">

          <div className="system-label">
            <span className="signal-dot"></span>
            Neural Guide Online
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
            Neural Guide
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#5cf2d6]/60">
            AI Engineering Mentor
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/50">
            Your intelligent engineering guide for coding, DSA, databases,
            operating systems, networking, projects and placement preparation.
          </p>

        </div>

        {/* Right System Info */}
        <div className="absolute right-8 top-8 hidden xl:block">
          <div className="rounded-2xl border border-emerald-300/10 bg-black/10 p-5 font-mono text-[10px] text-emerald-100/35">
            <p>MODULE: NEURAL_GUIDE</p>
            <p className="mt-2">CORE: AI_MENTOR</p>
            <p className="mt-2">INPUT: TEXT + IMAGE</p>
            <p className="mt-2 text-lime-300">
              STATUS: READY
            </p>
          </div>
        </div>

      </section>

      {/* PROMPT PROTOCOLS */}
      <section>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
            Quick Protocols
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            What do you want to solve?
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <PromptCard
            code="P-01"
            title="Debug Code"
            text="Find errors and fix code"
          />

          <PromptCard
            code="P-02"
            title="Explain Concept"
            text="Learn difficult topics simply"
          />

          <PromptCard
            code="P-03"
            title="Placement Path"
            text="Get preparation guidance"
          />

          <PromptCard
            code="P-04"
            title="Analyze Screenshot"
            text="Upload errors or questions"
          />

        </div>

      </section>

      {/* AI WORKSPACE */}
      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
              Neural Workspace
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              AI Conversation
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="signal-dot"></span>

            <span className="font-mono text-[10px] text-lime-200">
              LIVE
            </span>
          </div>

        </div>

        <div className="command-panel overflow-hidden rounded-[28px]">
          <AIMentor />
        </div>

      </section>

    </div>
  );
}

function PromptCard({
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