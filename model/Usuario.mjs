export class Usuario {
  constructor(id, nomeCompleto, email, senhaHash, dataCadastro) {
    this.id = id;
    this.nomeCompleto = nomeCompleto;
    this.email = email;
    this.senhaHash = senhaHash;
    this.dataCadastro = dataCadastro;
  }
}
