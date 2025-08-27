export class NotFoundError extends Error {
  constructor(message: string) {
    super(message); // Llama al constructor de Error
    this.name = "NotFoundError"; // Asigna el nombre del error
  }
}
