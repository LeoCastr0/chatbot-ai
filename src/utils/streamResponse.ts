import { openai } from "../clients/openai.ts"
import type { Message } from "../types.ts"

export async function streamResponse(history: Message[], system = "Voce e um assistente util e prestativo") {
  let fullResponse = ""

  const stream = await openai.chat.completions.create({
    model: "chatgpt-4o-mini",
    messages: [
      { role: "system", content: system },
      ...history,
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      process.stdout.write(delta)
      fullResponse += delta;
    }
  }

  console.log("\n")
  return fullResponse;
}
