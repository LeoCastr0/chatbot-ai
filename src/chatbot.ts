import * as readline from "node:readline/promises"
import * as crypto from "node:crypto"
import { streamResponse } from "./utils/streamResponse.ts"
import { ContextWindow } from "./contextWindow.ts"
import { MessageRepository } from "./messageRepository.ts"
import { maybeCompress } from "./utils/maybeCompress.ts"
import { stitchContext } from "./utils/stitchContext.ts"
import { validateInput } from "./utils/validateInput.ts"
import { validateOutput } from "./utils/validateOutput.ts"

const systemPrompt = process.argv[2]
const windowId = process.argv[3] || crypto.randomUUID();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const contextWindow = new ContextWindow();
const messageRepository = new MessageRepository();
const initialMessages = messageRepository.load(windowId);

initialMessages.forEach(message => {
  contextWindow.restore(message.role, message.content);
});

while (true) {
  const userPrompt = await rl.question("Voce (Digite sua pergunta ou 'sair' para encerrar): ")

  if (userPrompt.toLocaleLowerCase() === "sair") {
    console.log("Encerrando sessao do chatbot. Ate logo!");
    break;
  }

  const inputResult = validateInput(userPrompt, ["senha", "pix", "cpf", "cnh", "cartao de credito"], 1000);

  if (!inputResult.isValid) {
    console.log("Entrada invalida:", inputResult.errors.join(", "));
    continue;
  }

  messageRepository.save(windowId, contextWindow.addUserMessage(userPrompt));

  const compressed = await maybeCompress(contextWindow);
  const stitched = stitchContext({
    recentMessages: compressed
  })

  process.stdout.write("Assistente: Estou gerando a resposta, aguarde por favor ... \n\n");

  const fullResponse = await streamResponse(stitched, systemPrompt);

  const outputResult = validateOutput(fullResponse, ["eu acho que voce deveria fazer", "voce deve fazer", "o meu conselho para voce e"]);

  if (!outputResult.isValid) {
    console.log("Saida invalida:", outputResult.errors.join(", "));
    continue;
  }

  messageRepository.save(windowId, contextWindow.addAssistantMessage(fullResponse));
}

console.log(`-------------------------------- Para resumir essa sessao, utilize o identificador: ${windowId} --------------------------------`);

rl.close()
