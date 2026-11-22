import type { Message } from './types.ts'

export class ContextWindow {
  private history: Message[] = [];
  private readonly maxHistoryLength: number;

  constructor(maxHistoryLength: number = 100) {
    this.maxHistoryLength = maxHistoryLength;
  }

  addUserMessage(content: string): Message {
    const message = { role: "user", content } as Message;
    this.history.push(message);
    this.slidingWindow();
    return message
  }

  addAssistantMessage(content: string) {
    const message = { role: "assistant", content } as Message;
    this.history.push(message);
    this.slidingWindow();
    return message
  }

  restore(role: Message["role"], content: string) {
    this.history.push({ role, content });
  }

  getMessages() {
    return this.history;
  }

  private slidingWindow() {
    const limit = this.maxHistoryLength * 2;
    if (this.history.length > limit) {
      this.history = this.history.slice(-limit);
      // Mantem todo o registro em memoria, mas limita o que e enviado para o modelo
      // return this.history = this.history.slice(-limit);
    }
  }
}
