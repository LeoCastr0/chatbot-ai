import { VectorRepository } from "./vectorRepository.ts"
import { safeRagAnswer } from "./utils/safeRagAnswer.ts"
import { ragDebug } from "./utils/ragDebug.ts"

const vectorRepository = new VectorRepository();

const question = "Quantos dias de ferias eu posso tirar?"

await ragDebug(question, vectorRepository);

console.log("\n----------- RESPOSTA: ---------");
console.log(await safeRagAnswer(question, vectorRepository, ["senha"]));
