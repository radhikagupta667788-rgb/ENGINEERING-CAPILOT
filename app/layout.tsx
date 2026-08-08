import "./globals.css";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "AI Engineering Copilot",
  description: "AI Operating System for Engineering Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">

        <div className="flex min-h-screen">

          {/* LEFT SIDEBAR */}
          <Sidebar />

          {/* RIGHT SIDE */}
          <div className="flex min-h-screen flex-1 flex-col">

            {/* TOP NAVBAR */}
            <Navbar />

            {/* PAGE CONTENT */}
            <main className="flex-1 overflow-x-hidden bg-slate-50 p-6 md:p-8">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>

          </div>

        </div>

      </body>
    </html>
  );
}