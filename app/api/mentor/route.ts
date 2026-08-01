import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";


export async function POST(request: Request) {

  try {

    const formData = await request.formData();


    const question =
      formData.get("question")?.toString() ||
      "Analyze the uploaded image";


    const image =
      formData.get("image") as File | null;



    const apiKey = process.env.GEMINI_API_KEY;


    if (!apiKey) {

      return NextResponse.json(
        {
          error: "Gemini API key missing"
        },
        {
          status: 500
        }
      );

    }



    const ai = new GoogleGenAI({
      apiKey: apiKey
    });



    const parts: any[] = [

      {
        text: `
You are an AI Engineering Mentor.

Student Question:
${question}

Give a clear step-by-step solution.
Explain concepts simply.
If image contains code, error, question, or diagram,
analyze it and provide the solution.
`
      }

    ];



    if (image) {


      const bytes =
        await image.arrayBuffer();


      const base64 =
        Buffer.from(bytes)
        .toString("base64");


      parts.push({

        inlineData: {

          mimeType: image.type,

          data: base64

        }

      });


    }




    const response =
      await ai.models.generateContent({

        model: "gemini-2.0-flash-lite",

        contents: [

          {
            role: "user",

            parts: parts

          }

        ]

      });



    return NextResponse.json({

      result:
      response.text || "No response generated"

    });



  } catch (error: any) {


    console.log(
      "GEMINI ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
        error.message ||
        "Gemini failed"
      },
      {
        status: 500
      }
    );

  }

}