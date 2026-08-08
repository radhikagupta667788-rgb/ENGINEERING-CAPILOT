import LearningWorkspace from "@/components/learning/LearningWorkspace";

export default function LearningPage() {
  return (
    <div className="space-y-7">

      {/* HEADER */}
      <section className="signal-panel relative overflow-hidden rounded-[30px] p-7 md:p-9">

        <div className="relative z-10 max-w-3xl">

          <div className="system-label">
            <span className="signal-dot" />
            Knowledge Deck Online
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
            Knowledge Deck
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#5cf2d6]/60">
            Smart AI Learning System
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/50">
            Transform study material into summaries, notes,
            interactive quizzes and AI flashcards inside one
            intelligent engineering learning workspace.
          </p>

        </div>

        <div className="absolute right-8 top-8 hidden xl:block">

          <div className="rounded-2xl border border-emerald-300/10 bg-black/10 p-5 font-mono text-[10px] text-emerald-100/35">

            <p>
              MODULE: KNOWLEDGE_DECK
            </p>

            <p className="mt-2">
              MODE: SMART_LEARNING
            </p>

            <p className="mt-2">
              INPUT: STUDY_MATERIAL
            </p>

            <p className="mt-2 text-lime-300">
              STATUS: READY
            </p>

          </div>

        </div>

      </section>

      {/* CONNECTED WORKSPACE */}
      <LearningWorkspace />

    </div>
  );
}