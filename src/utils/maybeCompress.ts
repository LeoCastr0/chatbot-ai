import { ContextWindow } from "../contextWindow.ts"
import { estimateTokens } from "./estimateTokens.ts"
import { summarizeHistory } from "./summarizeHistory.ts"
import type { Message } from "../types.ts"

const MAX_TOKENS = 4096

export async function maybeCompress(contextWindow: ContextWindow): Promise<Message[]> {
  const currentTokenCount = estimateTokens(contextWindow);
  if (currentTokenCount < MAX_TOKENS) {
    return contextWindow.getMessages();
  }
  const half = Math.floor(contextWindow.getMessages().length / 2);
  const messagesToKeep = contextWindow.getMessages().slice(half);
  const messagesToSummarize = contextWindow.getMessages().slice(0, half);

  const summary = await summarizeHistory(messagesToSummarize);

  return [
    { role: "user", content: `Resumo das conversas anteriores\n ${summary}` },
    { role: "assistant", content: "Entendido, vou continuar a partir deste ponto.\n" },
    ...messagesToKeep
  ]
}
