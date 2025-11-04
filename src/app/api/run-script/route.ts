import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript"
import g from "@/lib/gptScriptInstance";
import path from "path";

const script = path.join(process.cwd(), "src/app/api/run-script/story-book.gpt")

export async function POST(request: NextRequest) {
  const {story, pages, path: userPath} = await request.json()
  
  // Use absolute path for output directory
  const outputPath = path.resolve(userPath || "./output")
  
  // gptscript command format
  // gptscript ./story-book.gpt --story {story} --pages {pages} --path {path}
  const opts: RunOpts = {
    disableCache: true,
    input: `--story "${story}" --pages ${pages} --path "${outputPath}"`
  }

  try {
    const encoder = new TextEncoder()
    let controllerClosed = false
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const run = await g.run(script, opts)

          run.on(RunEventType.Event, (data) => {
            if (!controllerClosed) {
              try {
                controller.enqueue(encoder.encode(`event: ${JSON.stringify(data)}\n\n`))
              } catch (e) {
                console.log("Controller enqueue error:", e)
              }
            }
          })

          await run.text()

          if (!controllerClosed) {
            controllerClosed = true
            controller.close()
          }
        } catch(error) {
          console.log("GPTScript error:", error)
          if (!controllerClosed) {
            controllerClosed = true
            controller.error(error)
          }
        }
      },
      cancel() {
        controllerClosed = true
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    })
  } catch(error) {
    console.log("Route error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({error: errorMessage}), {status: 500})
  }
}