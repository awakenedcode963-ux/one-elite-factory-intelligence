export interface IInvestigationRepository<T = any> {
  findById(id: string): Promise<T>;
  save(investigation: T): Promise<void>;
}
