"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";


export default function Sidebar() {

  const pathname = usePathname();


  const menu = [
    {
      name: "🏠 Dashboard",
      path: "/"
    },
    {
      name: "🤖 AI Mentor",
      path: "/mentor"
    },
    {
      name: "💻 Coding Assistant",
      path: "/coding"
    },
    {
      name: "📄 Resume Analyzer",
      path: "/resume"
    },
    {
      name: "🎤 AI Interview",
      path: "/interview"
    },
    {
      name: "📚 Smart Learning",
      path: "/learning"
    }
  ];


  return (

    <aside className="
      min-h-screen
      w-72
      border-r
      p-6
      bg-[var(--background)]
      text-[var(--foreground)]
    ">


      <h1 className="
        text-2xl
        font-bold
        mb-8
      ">
        🤖 AI Copilot
      </h1>



      <div className="flex flex-col gap-3">


        {
          menu.map((item)=>(

            <Link

              key={item.path}

              href={item.path}

              className={`
                rounded-xl
                px-4
                py-3
                cursor-pointer
                transition

                ${
                  pathname === item.path
                  ?
                  "bg-blue-600 text-white"
                  :
                  "hover:bg-blue-500/20"
                }
              `}

            >

              {item.name}

            </Link>

          ))
        }


      </div>



      <div className="
        mt-10
        border-t
        pt-5
      ">

        <p className="mb-3 text-sm text-gray-400">
          Theme
        </p>

        <ThemeToggle />

      </div>


    </aside>

  );
}