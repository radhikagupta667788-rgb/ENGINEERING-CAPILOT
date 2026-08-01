import FeatureCard from "@/components/FeatureCard";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StudyProgress from "@/components/dashboard/StudyProgress";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)]">
      <section className="theme-card rounded-3xl p-8 shadow-sm">
        <p className="theme-muted text-sm font-semibold uppercase tracking-widest">
          Engineering Student Workspace
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          👋 Welcome to AI Engineering Copilot
        </h1>

        <p className="theme-muted mt-3 max-w-2xl">
          Learn faster, improve your coding, prepare for placements and track
          your progress from one dashboard.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            🔥 7 Day Streak
          </span>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            🎯 Placement Score: 68%
          </span>

          <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
            🚀 Goal: 12 LPA
          </span>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="AI Chats" value="12" icon="💬" />
        <StatsCard title="Questions Asked" value="38" icon="🤖" />
        <StatsCard title="Study Hours" value="18h" icon="⏳" />
        <StatsCard title="DSA Solved" value="65" icon="🧠" />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <QuickActions />
        <StudyProgress />
      </section>

      <section className="theme-card mt-8 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          ✨ AI Recommendations
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold">
              🧠 Practice DSA
            </h3>
            <p className="theme-muted mt-2 text-sm">
              Solve two array and binary-search questions today.
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <h3 className="font-semibold">
              🗄️ Improve SQL
            </h3>
            <p className="theme-muted mt-2 text-sm">
              Revise joins, subqueries and normalization.
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <h3 className="font-semibold">
              📄 Update Resume
            </h3>
            <p className="theme-muted mt-2 text-sm">
              Add measurable results to your project descriptions.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <RecentActivity />
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-bold">
            Explore AI Tools
          </h2>

          <p className="theme-muted mt-1">
            Open any module and continue your preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            title="🤖 AI Mentor"
            description="Solve doubts and understand engineering concepts."
            href="/mentor"
          />

          <FeatureCard
            title="💻 Coding Assistant"
            description="Find bugs, optimize code and understand complexity."
            href="/coding"
          />

          <FeatureCard
            title="📄 Resume Analyzer"
            description="Check ATS score and improve your resume."
            href="/resume"
          />

          <FeatureCard
            title="🎤 AI Mock Interview"
            description="Practice technical and HR interview questions."
            href="/interview"
          />

          <FeatureCard
            title="📚 Smart Learning"
            description="Chat with PDFs and generate notes or quizzes."
            href="/learning"
          />

          <FeatureCard
            title="📊 Placement Dashboard"
            description="Track DSA, SQL and aptitude progress."
            href="/"
          />
        </div>
      </section>
    </main>
  );
}