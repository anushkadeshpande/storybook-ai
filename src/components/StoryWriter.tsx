'use client'
import React, { useState } from "react";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Frame } from "@gptscript-ai/gptscript";
import renderEventMessage from "@/lib/renderEventMessage";

const storiesPath = 'public/stories'

const StoryWriter = () => {
  const [story, setStory] = useState("");
  const [pages, setPages] = useState<number>();
  const [progress, setProgress] = useState("");
  
  
  const [runStarted, setRunStarted] = useState<boolean>(false);
  const [runFinished, setRunFinished] = useState<boolean | null>(null);

  const [currentTool, setCurrentTool] = useState("");

  const [events, setEvents] = useState<Frame[]>([]);

  const runScript = async() => {
    setRunStarted(true)
    setRunFinished(false)

    const response = await fetch('/api/run-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({story, pages, path: storiesPath})
    })

    if(response.ok && response.body) {
      // api call was successful
      console.log("Streaming started")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      handleStream(reader, decoder)
    } else {
      setRunFinished(true)
      setRunStarted(false)
      console.error("Failed to start streaming! 😿")
    }
  }

  async function handleStream(reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder) {
    // manages the response stream from the API
    while(true) {
      const {done, value} = await reader.read()

      if(done)
        break;

      const chunk = decoder.decode(value, { stream: true })

      // split the chunks by the event
      const eventData = chunk.split("\n\n")
                              .filter(line => line.startsWith("event: "))
                              .map(line => line.replace(/^event: /, ""))


      // parse the json data and update the state
      eventData.forEach(data => {
        try {
          const parsedData = JSON.parse(data)

          if(parsedData.type === "callProgress") {
            setProgress(parsedData.output[parsedData.output.length - 1].content)
            setCurrentTool(parsedData.tool?.description || "")
          } else if(parsedData.type === "callStart") {
            setCurrentTool(parsedData.tool?.description || "")
          } else if(parsedData.type === "runFinish") {
            setRunFinished(true)
            setRunStarted(false)
          } else {
            setEvents(prevEvents => [...prevEvents, parsedData])
          }
        } catch (error) {
          console.log("Failed to parse JSON: ", error)
        }
      })
    }
  }

  return (
    <div className="flex flex-col container">
      <section className="flex-1 flex flex-col border border-purple-300 rounded-md p-10 space-y-2">
        <Textarea
          value={story}
          onChange={e => setStory(e.target.value)}
          className="flex-1 text-black"
          placeholder="Write a story about ....."
        />

        <Select onValueChange={value => setPages(+value)}>
          <SelectTrigger>
            <SelectValue placeholder="How many pages should the story be?" />
          </SelectTrigger>

          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button disabled={!story || !pages || runStarted} onClick={runScript}>Generate Story 🚀</Button>
      </section>


      <section className="flex-1 pb-5 mt-5">
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-scroll">
            <div>
              {
                runFinished === null && (<>
                  <p className="animate-pulse mr-5">{"I'm waiting for you to write a prompt! 🐱"}</p>
                </>) 
              }
              <span className="mr-5">{">>"}</span>
              {progress}
            </div>

            {currentTool && (<div className="py-10">
              <span className="mr-5">{"----- [Current Tool] -----"}</span>
            </div>)}

            <div className="space-y-5">
              {events.map((event, index) => (
                <div key={index}>
                  <span className="mr-5">{">>"}</span>
                  {renderEventMessage(event)}
                </div>
              ))}
            </div>

            {runStarted && (
              <div>
                <span className="mr-5 animate-in">{"----- [AI StoryTeller has started] -----"}</span>
                <br />
              </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default StoryWriter;
