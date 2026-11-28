import { VectorRepository } from "../vectorRepository.ts"
import { embed } from "./embed.ts"
import { ragAnswer } from "./ragAnswer.ts"

export async function safeRagAnswer(question: string, repo: VectorRepository, blockedSignals: string[]) {

  // guarda 1: Validar se a pergunta nao tenta extrair informacoes fora de escopo
  if (blockedSignals.some(b => question.toLowerCase().includes(b.toLowerCase()))) {
    return "Nao posso responder a esse tipo de pergunta com base nos documentos disponiveis";
  }

  const questionEmbeddings = await embed(question);
  const results = repo.search(question, questionEmbeddings, 5);

  // guarda 2: verificar se ha contexto minimamente relevante antes de chamar o LLM
  if (results.length === 0) {
    return "Nao encontrei informacoes suficientes para essa pergunta";
  }

  return ragAnswer(question, repo);
}
