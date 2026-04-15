import { db, counters } from './DbService.mjs';
import { Modulo } from '../model/Modulo.mjs';
import { Aula } from '../model/Aula.mjs';

export class ConteudoService {
  // ── Módulos ──────────────────────────────────────────────────────────────────
  salvarModulo(idCurso, titulo, ordem) {
    const modulo = new Modulo(counters.modulo++, idCurso, titulo, ordem);
    db.modulos.push(modulo);
    return modulo;
  }

  // ── Aulas ─────────────────────────────────────────────────────────────────────
  salvarAula(idModulo, titulo, tipoConteudo, urlConteudo, duracaoMinutos, ordem) {
    const aula = new Aula(
      counters.aula++, idModulo, titulo,
      tipoConteudo, urlConteudo, duracaoMinutos, ordem
    );
    db.aulas.push(aula);
    return aula;
  }

  // ── Estrutura Curso > Módulo > Aula ─────────────────────────────────────────
  listarConteudo() {
    return [...db.modulos].sort((a, b) => a.ordem - b.ordem).map(modulo => ({
      modulo,
      curso: db.cursos.find(c => String(c.id) === String(modulo.idCurso)),
      aulas: db.aulas
        .filter(a => String(a.idModulo) === String(modulo.id))
        .sort((a, b) => a.ordem - b.ordem)
    }));
  }
}
