export type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
}

export type RagExample = {
  q: string;
  a: string;
}

export interface IRepository<T> {
  save(session: string, data: T): void;
  load(session: string): T[];
}
