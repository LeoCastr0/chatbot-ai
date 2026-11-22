import type { Message } from "../types.ts"

export function stitchContext(
  params: {
    summary?: string;
    userProfile?: string;
    recentMessages: Message[];
  }
) {
  const stitched: Message[] = []

  if (params.summary) {
    stitched.push({ role: "user", content: `Resumo das conversas anteriores:\n ${params.summary}` })
    stitched.push({ role: "assistant", content: `Entendido, vou continuar a partir deste ponto.` })
  }
  if (params.userProfile) {
    stitched.push({ role: "user", content: `Perfil do usuario ${params.userProfile}` })
    stitched.push({ role: "assistant", content: `Entendido.` })
  }

  return [
    ...stitched,
    ...params.recentMessages
  ]
}
