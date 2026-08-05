"use client";

import { useState } from "react";
import { markActive } from "@/lib/notifications";


export default function AIMentor() {

  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);



  const askAI = async () => {

    if (!question && !image) return;


    setLoading(true);


    const formData = new FormData();


    formData.append(
      "question",
      question || "Analyze this image"
    );


    if (image) {
      formData.append(
        "image",
        image
      );
    }



    try {

      const res = await fetch(
        "/api/mentor",
        {
          method: "POST",
          body: formData
        }
      );


      const data = await res.json();


      setAnswer(
  data.result || data.error
);
if (data.result) markActive();


    } catch (error) {

      setAnswer(
        "Something went wrong"
      );

    }


    setLoading(false);

  };



  return (

    <div className="theme-card rounded-3xl p-8">


      <h1 className="text-3xl font-bold">
        🤖 AI Mentor
      </h1>


      <p className="theme-muted mt-2">
        Ask questions or upload screenshots
      </p>



      <label className="mt-6 inline-block cursor-pointer rounded-xl border px-5 py-3">

        📷 Upload Image


        <input

          type="file"

          accept="image/*"

          className="hidden"

          onChange={(e)=>
            setImage(
              e.target.files?.[0] || null
            )
          }

        />

      </label>



      {
        image && (

          <p className="mt-3 text-green-500">
            ✅ {image.name}
          </p>

        )
      }




      <textarea

        className="mt-5 h-32 w-full rounded-xl border p-4"

        placeholder="Ask your engineering doubt..."

        value={question}

        onChange={(e)=>
          setQuestion(e.target.value)
        }

      />




      <button

        onClick={askAI}

        className="theme-primary mt-5 rounded-xl px-6 py-3"

      >

        {
          loading
          ?
          "🤖 Thinking..."
          :
          "Ask AI"
        }

      </button>




      {
        answer && (

          <div className="mt-8 rounded-xl border p-5">

            <h2 className="font-bold">
              Solution
            </h2>


            <p className="mt-3 whitespace-pre-wrap">
              {answer}
            </p>

          </div>

        )
      }



    </div>

  );

}