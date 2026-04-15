import { UsuarioService } from '../service/UsuarioService.mjs';
import { db, byId, formatDate } from '../service/DbService.mjs';
import { refreshSelects } from './NavbarController.mjs';
import { showMessage, validEmail, validateRequired } from '../utils.mjs';

const svc = new UsuarioService();

// ── Renders ───────────────────────────────────────────────────────────────────
export function renderMatriculas() {
  const lista = document.getElementById('listaMatriculas');
  lista.innerHTML = '';
  if (db.matriculas.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-secondary">Nenhuma matrícula registrada.</li>';
    return;
  }
  db.matriculas.forEach(m => {
    const usuario = byId(db.usuarios, m.idUsuario);
    const curso = byId(db.cursos, m.idCurso);
    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.textContent = `${usuario?.nomeCompleto || 'Usuário'} em ${curso?.titulo || 'Curso'} (${formatDate(m.dataMatricula)})`;
    lista.appendChild(item);
  });
}

export function renderProgresso() {
  const body = document.getElementById('tabelaProgressoBody');
  body.innerHTML = '';
  db.progressoAulas.forEach(p => {
    const usuario = byId(db.usuarios, p.idUsuario);
    const aula = byId(db.aulas, p.idAula);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${usuario?.nomeCompleto || '—'}</td>
      <td>${aula?.titulo || '—'}</td>
      <td>${p.status}</td>
      <td>${formatDate(p.dataConclusao)}</td>`;
    body.appendChild(row);
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────
export function initUsuarioHandlers() {
  // Cadastro de usuário
  document.getElementById('usuarioForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#usuarioNome', '#usuarioEmail', '#usuarioSenha'])) {
      showMessage('Preencha os campos obrigatórios do usuário.', 'warning');
      return;
    }
    const email = document.getElementById('usuarioEmail').value.trim();
    if (!validEmail(email)) {
      showMessage('Formato de e-mail inválido.', 'warning');
      return;
    }
    try {
      svc.salvar(
        document.getElementById('usuarioNome').value.trim(),
        email,
        document.getElementById('usuarioSenha').value.trim()
      );
      form.reset();
      refreshSelects();
      showMessage('Usuário cadastrado com sucesso.');
    } catch (err) {
      showMessage(err.message, 'warning');
    }
  });

  // Matrícula
  document.getElementById('matriculaForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#matriculaUsuario', '#matriculaCurso'])) {
      showMessage('Selecione usuário e curso.', 'warning');
      return;
    }
    svc.matricular(
      Number(document.getElementById('matriculaUsuario').value),
      Number(document.getElementById('matriculaCurso').value)
    );
    form.reset();
    renderMatriculas();
    showMessage('Matrícula realizada.');
  });

  // Progresso
  document.getElementById('progressoForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#progressoUsuario', '#progressoAula'])) {
      showMessage('Selecione usuário e aula.', 'warning');
      return;
    }
    svc.atualizarProgresso(
      Number(document.getElementById('progressoUsuario').value),
      Number(document.getElementById('progressoAula').value),
      document.getElementById('progressoStatus').value
    );
    form.reset();
    renderProgresso();
    showMessage('Progresso atualizado.');
  });

  // Certificado (formulário dentro do modal)
  document.getElementById('certificadoForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#certificadoUsuario', '#certificadoCurso'])) {
      showMessage('Selecione usuário e curso para emitir certificado.', 'warning');
      return;
    }
    const idUsuario = Number(document.getElementById('certificadoUsuario').value);
    const idCurso = Number(document.getElementById('certificadoCurso').value);
    const cert = svc.emitirCertificado(idUsuario, idCurso);
    const usuario = byId(db.usuarios, idUsuario);
    const curso = byId(db.cursos, idCurso);
    document.getElementById('certificadoOutput').innerHTML = `
      <strong>${usuario?.nomeCompleto || '—'}</strong><br/>
      Concluiu o curso <strong>${curso?.titulo || '—'}</strong><br/>
      Código de verificação: <code>${cert.codigoVerificacao}</code><br/>
      Emissão: ${formatDate(cert.dataEmissao)}`;
    form.reset();
    showMessage('Certificado emitido.');
  });
}
