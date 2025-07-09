export function createSlug(username: string) {
  return username
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") //remove marcas diacríticas
    .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífen
    .replace(/-+/g, "-") // Remove hífen duplicado
    .toLocaleLowerCase()
    .trim();
}
