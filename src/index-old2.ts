import { embed } from "./utils/embed.ts"
import { VectorRepository } from "./vectorRepository.ts"

const vectorRepository = new VectorRepository(":memory:");

const doc1 = "O prazo de entrega e de cinco dias uteis.";
const doc2 = "Aceitamos cartao de credito, boleto e PIX.";
const doc3 = "Para cancelar, acesse Configuracoes > Cancelar pedido.";

vectorRepository.insert("faq", doc1, await embed(doc1));
vectorRepository.insert("faq", doc2, await embed(doc2));
vectorRepository.insert("faq", doc3, await embed(doc3));

const input = await embed("Qual e o prazo de entrega?");
const results = vectorRepository.search(input);

results.forEach((r) => {
  console.log(`Score: ${r.score.toFixed(2)} - ${r.chunk}`)
})
