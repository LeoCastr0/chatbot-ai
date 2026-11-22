import { ContextWindow } from "../contextWindow.ts"

export function estimateTokens(contextWindow: ContextWindow): number {

  const averageCharsPerToken = 3;

  return contextWindow.getMessages().reduce((totalTokens, message) => {
    const messageLength = message.content.length;
    const estimatedTokens = Math.ceil(messageLength / averageCharsPerToken);
    return totalTokens + estimatedTokens;
  }, 0)
}
