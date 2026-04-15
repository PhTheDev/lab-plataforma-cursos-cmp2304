export class Curso {
  constructor(id, titulo, descricao, idInstrutor, idCategoria, nivel, dataPublicacao, totalHoras) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.idInstrutor = idInstrutor;
    this.idCategoria = idCategoria;
    this.nivel = nivel;
    this.dataPublicacao = dataPublicacao;
    this.totalHoras = totalHoras;
  }
}
