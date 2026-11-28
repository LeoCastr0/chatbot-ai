import { openai } from "../clients/openai.ts"
import { VectorRepository } from "../vectorRepository.ts"
import { embed } from "./embed.ts"
import { buildRagPrompt } from "./buildRagPrompt.ts"

export async function ragAnswer(question: string, repo: VectorRepository) {
  // 1. embeds a pergunta
  const questionEmbeddings = await embed(question);

  // 2. buscar os chunks mais relevantes
  const results = repo.search(question, questionEmbeddings, 5);
  const chunks = results.map(r => r.chunk);

  // 3. monta o prompt e chama o modelo
  const prompt = buildRagPrompt(question, chunks);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  // 4. Retorna a resposta final
  return response.choices[0].message.content ?? "";
}
