import { withRetry } from "./withRetry.ts"
import { openai } from "../clients/openai.ts"

export async function generateWithCritique<T>(
  system: string,
  prompt: string
): Promise<string> {
  // step 1: generate initial response
  const draft = await withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
    });
    return response.choices[0].message?.content ?? "";
  })

  // step 2: generate critique
  const critique = await withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-mini",
      messages: [
        { role: "system", content: `identifique em 1 frase pontos de melhorias e criticas na resposta. se estiver boa diga "approved", se nao diga o que pode/pode ser melhorado baseado na sua analise e criticas.` },
        { role: "user", content: draft }
      ],
    });
    return response.choices[0].message?.content ?? "";
  })

  // step 3: Generate final response based of critique
  if (critique.toLocaleLowerCase() === "approved") {
    return draft
  }

  return await withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-mini",
      messages: [
        { role: "system", content: `rescreva a resposta anterior considerando as criticas e/ou melhorias recebidas.` },
        { role: "user", content: `Resposta anterior: ${draft}\n\nCriticas/Melhorias: ${critique}` }
      ]
    });
    return response.choices[0].message?.content ?? "";
  })
}
