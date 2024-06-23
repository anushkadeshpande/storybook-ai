import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript"

export async function POST(request: NextRequest) {
  const {story, pages, path} = await request.json()

  const opts: RunOpts = {
    disableCache: true,

    // gptscript command format
    // gptscript ./story-book.gpt --story {story} --pages {pages} --path {path}
    input: `--story ${story} --pages ${pages} --path ${path}`
  }

  try {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {

        } catch(error) {
          controller.error(error)
          console.log(error)
        }
      }
    })
  } catch(error) {
    return new Response(JSON.stringify({error: error}), {status: 500})
  }
}