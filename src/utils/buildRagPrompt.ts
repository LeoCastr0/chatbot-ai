import type { RagExample } from "../types.ts"

export function buildRagPrompt(question: string, chunks: string[], examples?: RagExample[]) {
  const context = chunks.join("\n\n---\n\n\n");
  const fewShot = examples?.map((example) => `Pergunta: ${example.q}\nResposta: ${example.a}`).join("\n\n") ?? "";

  return `
    [instrucao]
    Responda a primeira pergunta usando APENAS o contexto abaixo
    Primeiro, raciocine sobre quais partes do contexto sao relevantes.
    Segundo, formule uma resposta final.
    Se a resposta nao estiver no contexto, diga "nao encontrei informacoes suficientes para esta pergunta".

    ${fewShot ? `[Exemplos]\n${fewShot}` : ""}

    [Contexto]
    ${context}

    [Pergunta]
    ${question}
  `
}
