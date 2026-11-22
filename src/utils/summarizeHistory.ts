import { openai } from "../clients/openai.ts"
import type { Message } from "../types.ts"

export async function summarizeHistory(messages: Message[]): Promise<string> {
  const systemPrompt = `
    Voce e um assistente especializado em resumir conversas.
    Analise o historico de mensagenes e forneca um resumo conciso, destacando os prinicpais topicos discutidos, perguntas feitas e respostas fornecidas.
    Mantenha o resumo em liguagem acessivel e clara.
    Limite o resumo a um unico paragrafo, evitando detalhes excessivos, mas garantindo que os pontos principais sejam capturados.
  `;

  const summary = await openai.chat.completions.create({
    model: "chatgpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ]
  });

  return summary.choices[0].message?.content ?? "";
}
