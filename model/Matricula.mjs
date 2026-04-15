export class Matricula {
  constructor(id, idUsuario, idCurso, dataMatricula, dataConclusao = null) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idCurso = idCurso;
    this.dataMatricula = dataMatricula;
    this.dataConclusao = dataConclusao;
  }
}
