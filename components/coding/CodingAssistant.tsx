"use client";
import { markActive } from "@/lib/notifications";
import { useState } from "react";

export default function CodingAssistant() {

  const [code,setCode] = useState("");
  const [language,setLanguage] = useState("Java");
  const [mode,setMode] = useState("Debug Code");
  const [result,setResult] = useState("");
  const [loading,setLoading] = useState(false);


  const runAI = async()=>{

    if(!code.trim()){
      setResult("Code paste karo.");
      return;
    }

    setLoading(true);
    setResult("");

    try{

      const res = await fetch(
        "/api/coding",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            code,
            language,
            mode
          })
        }
      );


      const data = await res.json();

      if(!res.ok)
        throw new Error(data.error);


      setResult(data.result);
markActive();


    }catch(error){

      setResult(
        error instanceof Error
        ? error.message
        : "Error"
      );

    }
    finally{
      setLoading(false);
    }

  };


  return(
    <div className="theme-card mx-auto max-w-6xl rounded-3xl p-8 shadow-lg">


      <h1 className="text-3xl font-bold">
        💻 AI Coding Assistant
      </h1>


      <p className="theme-muted mt-2">
        Debug, explain and optimize your code with AI.
      </p>



      <div className="mt-8 grid gap-5 md:grid-cols-2">


        <div>
        <label className="font-semibold">
          Language
        </label>

        <select
        value={language}
        onChange={(e)=>setLanguage(e.target.value)}
        className="theme-card mt-2 w-full rounded-xl p-3"
        >

          <option>Java</option>
          <option>Python</option>
          <option>C++</option>
          <option>JavaScript</option>
          <option>SQL</option>

        </select>

        </div>



        <div>

        <label className="font-semibold">
          Mode
        </label>


        <select
        value={mode}
        onChange={(e)=>setMode(e.target.value)}
        className="theme-card mt-2 w-full rounded-xl p-3"
        >

          <option>Debug Code</option>
          <option>Explain Code</option>
          <option>Optimize Code</option>
          <option>Generate Test Cases</option>

        </select>

        </div>


      </div>




      <textarea

      value={code}

      onChange={(e)=>setCode(e.target.value)}

      placeholder="// Paste your code here..."

      className="theme-card mt-6 h-72 w-full rounded-2xl p-5 font-mono outline-none"

      />



      <button

      onClick={runAI}

      disabled={loading}

      className="theme-primary mt-5 rounded-xl px-7 py-3 font-semibold"

      >

      {
        loading
        ? "AI Thinking..."
        :"🚀 Run Assistant"
      }

      </button>



      {
        result &&

        <div className="mt-8 rounded-2xl border p-6">

          <h2 className="text-2xl font-bold">
            🤖 AI Response
          </h2>


          <pre className="mt-4 whitespace-pre-wrap leading-8">
            {result}
          </pre>

        </div>
      }



    </div>
  )

}