export interface IModelProvider {
  generateContent(prompt: string): Promise<string>;
}
