import { db, counters } from './DbService.mjs';
import { Categoria } from '../model/Categoria.mjs';
import { Curso } from '../model/Curso.mjs';
import { Trilha } from '../model/Trilha.mjs';
import { TrilhaCurso } from '../model/TrilhaCurso.mjs';

export class AcademicoService {
  // ── Categorias ──────────────────────────────────────────────────────────────
  salvarCategoria(nome, descricao) {
    if (db.categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
      throw new Error('Categoria já existe.');
    }
    const cat = new Categoria(counters.categoria++, nome, descricao);
    db.categorias.push(cat);
    return cat;
  }

  // ── Cursos ───────────────────────────────────────────────────────────────────
  salvarCurso({ titulo, descricao, idInstrutor, idCategoria, nivel, dataPublicacao, totalHoras, preco }) {
    const curso = new Curso(
      counters.curso++, titulo, descricao,
      idInstrutor, idCategoria, nivel, dataPublicacao, totalHoras, preco
    );
    db.cursos.push(curso);
    return curso;
  }

  listarCursosPorCategoria(categoriaId) {
    return db.cursos.filter(c => String(c.idCategoria) === String(categoriaId));
  }

  // ── Trilhas ──────────────────────────────────────────────────────────────────
  salvarTrilha(titulo, descricao, idCategoria) {
    const trilha = new Trilha(counters.trilha++, titulo, descricao, idCategoria);
    db.trilhas.push(trilha);
    return trilha;
  }

  associarCursoTrilha(idTrilha, idCurso, ordem) {
    const assoc = new TrilhaCurso(idTrilha, idCurso, ordem);
    db.trilhasCursos.push(assoc);
    return assoc;
  }

  listarTrilhaCursos() {
    return [...db.trilhasCursos].sort((a, b) => a.ordem - b.ordem);
  }
}
