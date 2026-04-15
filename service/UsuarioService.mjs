import { db, counters, nowIso, passwordHash } from './DbService.mjs';
import { Usuario } from '../model/Usuario.mjs';
import { Matricula } from '../model/Matricula.mjs';
import { ProgressoAula } from '../model/ProgressoAula.mjs';
import { Certificado } from '../model/Certificado.mjs';

export class UsuarioService {
  // ── Usuários ─────────────────────────────────────────────────────────────────
  salvar(nomeCompleto, email, senha) {
    if (db.usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('E-mail já cadastrado.');
    }
    const u = new Usuario(
      counters.usuario++, nomeCompleto, email,
      passwordHash(senha), nowIso()
    );
    db.usuarios.push(u);
    return u;
  }

  // ── Matrículas ───────────────────────────────────────────────────────────────
  matricular(idUsuario, idCurso) {
    const m = new Matricula(counters.matricula++, idUsuario, idCurso, nowIso());
    db.matriculas.push(m);
    return m;
  }

  // ── Progresso ────────────────────────────────────────────────────────────────
  atualizarProgresso(idUsuario, idAula, status) {
    const existente = db.progressoAulas.find(
      p => String(p.idUsuario) === String(idUsuario) &&
           String(p.idAula) === String(idAula)
    );
    if (existente) {
      existente.status = status;
      existente.dataConclusao = nowIso();
    } else {
      db.progressoAulas.push(new ProgressoAula(idUsuario, idAula, nowIso(), status));
    }
  }

  // ── Certificados ─────────────────────────────────────────────────────────────
  emitirCertificado(idUsuario, idCurso) {
    const cert = new Certificado(
      counters.certificado++, idUsuario, idCurso,
      `CERT-${Date.now().toString(36).toUpperCase()}`,
      nowIso()
    );
    db.certificados.push(cert);
    return cert;
  }
}
