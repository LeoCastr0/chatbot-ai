import * as crypto from "node:crypto"
import { ContextWindow } from "./contextWindow.ts"
import { generateWithCritique } from './utils/generateWithCritique.ts'
import { summarizeHistory } from "./utils/summarizeHistory.ts"
import { MessageRepository } from "./messageRepository.ts"

const windowId = process.argv[2] || crypto.randomUUID();
const contextWindow = new ContextWindow();
const messageRepository = new MessageRepository();

console.log(`-------------------------------- Sessao iniciada com identificador: ${windowId} --------------------------------`);

const initialMessages = messageRepository.load(windowId);

if (initialMessages.length > 0) {
  console.log(`-------------------------------- Restaurando historico de mensagens da sessao: ${windowId} --------------------------------`);
  console.log(`-------------------------------- ${initialMessages.length} messages restauradas --------------------------------`);
  initialMessages.forEach(message => {
    contextWindow.restore(message.role, message.content);
  });
}

const PERSONAS = {
  juridico: "Voce e um assistente especializado em direitos tributarios brasileiro. Responda sempre em linguagem acessivel para nao advogados ou contadores. Nunca de conselhos juridicos ou fiscais - apenas explique conceitos e teorias.",
  financeiro: "Voce e um assistente especializado em financas e contabilidade. Responda sempre em liguagem acessivel para nao especialistas. Nunca de concelhos financeiros - apenas explique conceitos e teorias.",
  tecnico: "Voce e um assistente especializado em tecnologia da informacao. Responda sempre em liguagem acessivel para nao tecnicos. Nunca de concelhos tecnicos - apenas explique conceitos e teorias.",
} as const

const contractText = `
  Clausula 3.1: O contratante podera recindir o contrato a qualquer momento em um periodo de 30 dias sem taxa
  Clausula 7.2: Multa de 30% sobre o valor total do contrato pago pelo contratante
`

function contractAnalysisPrompt(
  params: {
    contractText: string;
    clientType: "pf" | "pj";
    levelOfDetail: "high" | "medium" | "low";
  }
) {
  let levelOfDetailPrompt = 'identifique de forma resumida as clausulas mais relevantes que possam gerar riscos financeiros para o contratante, explicando resumidamente cada uma delas.';
  if (params.levelOfDetail === "high") {
    levelOfDetailPrompt = 'identifique detalhadamente todas as clausulas que possam gerar riscos financeiros para o contratante, explicando cada uma delas.'
  } else if (params.levelOfDetail === "medium") {
    levelOfDetailPrompt = 'identifique as clausulas mais relevantes que possam gerar riscos financeiros para o contratante, explicando cada uma delas.'
  }

  return `
    // 1. PAPEL - quem o modelo e (role prompting)
    Voce recebera um contrato de um cliente ${params.clientType === "pf" ? "pessoa fisica" : "pessoa juridica"}.

    // 2. INSTRUCAO - o que fazer
    Analise o testo abaixo e ${levelOfDetailPrompt}

    // 3. DADOS = separados da instrucao (separacao instrucao/dados)
    Contrato ${params.contractText}

    // 4. FORMATO - saida estruturada
    Responda em JSON com a seguinte estrutura:
    {
      "risks": [
        {
          "clause": "...",
          "risk": "high|medium|low",
          "explanation": "..."
        },
      ]
    }
  `.trim();
}

async function chatWithPersona(
  persona: keyof typeof PERSONAS,
  question: string
) {
  const systemPrompt = PERSONAS[persona];
  const userMessage = contextWindow.addAssistantMessage(question);

  messageRepository.save(windowId, userMessage);

  const response = await generateWithCritique(systemPrompt, contextWindow);

  const assistantMessage = contextWindow.addAssistantMessage(response);
  messageRepository.save(windowId, assistantMessage);

  console.log(`\n\n[${persona.toUpperCase()}] Resposta:\n`, response);
}

await chatWithPersona("juridico", contractAnalysisPrompt({ contractText, clientType: "pj", levelOfDetail: "low" }));

await chatWithPersona("juridico", "Quantas clausulas o meu contrato possui?");

await chatWithPersona("juridico", "Existe alguma multa no contrato?");

await chatWithPersona("juridico", "O contrato pode ser encerrado a qualquer momento?");

await chatWithPersona("juridico", "Qual foi minha primeira pergunta?");

console.log("-------------------------------- Resumo do historico de mensagens --------------------------------");
console.log(await summarizeHistory(contextWindow.getMessages()));

console.log(`-------------------------------- Para resumir essa sessao, utilize o identificador: ${windowId} --------------------------------`);

