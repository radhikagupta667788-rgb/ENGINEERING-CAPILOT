import Link from "next/link";

export default function QuickActions() {

  const actions = [
    {
      title: "🤖 Ask AI Mentor",
      desc: "Clear your engineering doubts instantly.",
      link: "/mentor",
    },
    {
      title: "💻 Code Review",
      desc: "Debug and improve your code.",
      link: "/coding",
    },
    {
      title: "📄 Resume Check",
      desc: "Improve ATS score.",
      link: "/resume",
    },
    {
      title: "🎤 Mock Interview",
      desc: "Practice company interviews.",
      link: "/interview",
    },
  ];


  return (
    <div className="theme-card rounded-3xl p-6">

      <h2 className="text-2xl font-bold">
        ⚡ Quick Actions
      </h2>


      <p className="theme-muted mt-2">
        Start learning with AI tools
      </p>


      <div className="mt-6 grid gap-4">

        {actions.map((item,index)=>(
          <Link
            key={index}
            href={item.link}
            className="rounded-2xl border border-white/10 p-4 hover:bg-blue-500/10 hover:-translate-y-1"
          >

            <h3 className="font-semibold">
              {item.title}
            </h3>

            <p className="theme-muted mt-1 text-sm">
              {item.desc}
            </p>

          </Link>
        ))}

      </div>


    </div>
  );
}