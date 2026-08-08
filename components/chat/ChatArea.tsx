"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";


export type Message = {
  text: string;
  sender: "user" | "ai";
};


type ChatAreaProps = {
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
};


export default function ChatArea({
  messages,
  onMessagesChange,
}: ChatAreaProps) {


  const [loading,setLoading] = useState(false);



  const sendMessage = async (message:string)=>{


    if(loading) return;



    const userMessage:Message = {

      text:message,

      sender:"user"

    };


    const updatedMessages = [
      ...messages,
      userMessage
    ];



    onMessagesChange(updatedMessages);


    setLoading(true);



    try{


      const formData = new FormData();

      formData.append(
        "question",
        message
      );



      const response = await fetch(
        "/api/mentor",
        {
          method:"POST",
          body:formData
        }
      );



      const text =
      await response.text();



      console.log(
        "API RESPONSE:",
        text
      );



      if(!text){

        throw new Error(
          "Empty response from API"
        );

      }



      const data =
      JSON.parse(text);




      if(data.error){

        throw new Error(
          data.error
        );

      }




      onMessagesChange([

        ...updatedMessages,

        {

          text:data.result,

          sender:"ai"

        }

      ]);



    }

    catch(error:any){


      onMessagesChange([

        ...updatedMessages,

        {

          text:
          "Error: "+error.message,

          sender:"ai"

        }

      ]);


    }

    finally{

      setLoading(false);

    }


  };



  return (

    <div className="flex h-[calc(100vh-113px)] flex-col">


      <div className="flex-1 overflow-y-auto p-6">


        {
          messages.map(
            (message,index)=>(

              <MessageBubble

                key={index}

                text={message.text}

                sender={message.sender}

              />

            )
          )
        }



        {
          loading && (

            <p className="text-gray-500">
              AI is thinking...
            </p>

          )
        }



      </div>



      <ChatInput
        onSend={sendMessage}
      />


    </div>

  );

}