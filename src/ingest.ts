import { readFileSync } from "node:fs"
import { VectorRepository } from "./vectorRepository.ts"
import { ingest } from "./utils/ingest.ts"

const vectorRepository = new VectorRepository();

const source1 = "docs/politica-de-ferias.txt";
const source2 = "docs/politica-de-final-de-ano.txt";

const doc1 = readFileSync(source1, "utf-8");
const doc2 = readFileSync(source2, "utf-8");

await ingest(source1, doc1, vectorRepository);
await ingest(source2, doc2, vectorRepository);
