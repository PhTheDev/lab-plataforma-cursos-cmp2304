/**
 * AlunoController.mjs — Catálogo de cursos e player de aulas para o aluno
 */
import { db, byId } from '../service/DbService.mjs';
import { UsuarioService } from '../service/UsuarioService.mjs';

const svc = new UsuarioService();

// ── Estado local ───────────────────────────────────────────────────────────────
let _idUsuario = null;
let _cursoAtivo = null;
let _aulaAtiva = null;

export function setUsuario(id) {
  _idUsuario = Number(id);
}

// ── Utilitários ────────────────────────────────────────────────────────────────
function getProgressoCurso(idCurso) {
  const modulos = db.modulos.filter(m => String(m.idCurso) === String(idCurso));
  const idAulas = db.aulas
    .filter(a => modulos.some(m => String(m.id) === String(a.idModulo)))
    .map(a => a.id);
  if (idAulas.length === 0) return 0;
  const concluidas = db.progressoAulas.filter(
    p => String(p.idUsuario) === String(_idUsuario) &&
         idAulas.includes(p.idAula) &&
         p.status === 'Concluído'
  ).length;
  return Math.round((concluidas / idAulas.length) * 100);
}

function isAulaConcluida(idAula) {
  return db.progressoAulas.some(
    p => String(p.idUsuario) === String(_idUsuario) &&
         String(p.idAula) === String(idAula) &&
         p.status === 'Concluído'
  );
}

// ── Catálogo ──────────────────────────────────────────────────────────────────
export function renderCatalogo() {
  const grid = document.getElementById('cursosGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const cursos = db.cursos;
  if (cursos.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center text-muted py-5">
      <i class="bi bi-collection-play fs-1 d-block mb-3 opacity-50"></i>
      <p>Nenhum curso disponível no momento.</p>
    </div>`;
    return;
  }

  cursos.forEach(curso => {
    const progresso = getProgressoCurso(curso.id);
    const instrutor = byId(db.usuarios, curso.idInstrutor);
    const categoria = byId(db.categorias, curso.idCategoria);
    const aulas = db.aulas.filter(a =>
      db.modulos.filter(m => String(m.idCurso) === String(curso.id)).some(m => String(m.id) === String(a.idModulo))
    );

    const badgeColor = {
      'Iniciante': 'success',
      'Intermediário': 'warning',
      'Avançado': 'danger'
    }[curso.nivel] || 'secondary';

    const card = document.createElement('div');
    card.className = 'col-12 col-md-6 col-xl-4';
    card.innerHTML = `
      <div class="course-card h-100">
        <div class="course-card-header">
          <div class="course-icon">
            <i class="bi bi-play-circle-fill"></i>
          </div>
          <span class="badge bg-${badgeColor} bg-opacity-25 text-${badgeColor === 'warning' ? 'warning' : badgeColor} border border-${badgeColor} border-opacity-50">${curso.nivel}</span>
        </div>
        <div class="course-card-body">
          <h3 class="course-title">${curso.titulo}</h3>
          <p class="course-desc">${curso.descricao || ''}</p>
          <div class="course-meta">
            <span><i class="bi bi-person-circle me-1"></i>${instrutor?.nomeCompleto || 'Instrutor'}</span>
            <span><i class="bi bi-tag me-1"></i>${categoria?.nome || 'Geral'}</span>
            <span><i class="bi bi-clock me-1"></i>${curso.totalHoras}h</span>
            <span><i class="bi bi-collection-play me-1"></i>${aulas.length} aulas</span>
          </div>
          <div class="course-progress-wrap mt-3">
            <div class="d-flex justify-content-between mb-1">
              <small class="text-muted">Progresso</small>
              <small class="fw-semibold text-accent">${progresso}%</small>
            </div>
            <div class="progress course-progress-bar">
              <div class="progress-bar" role="progressbar" style="width:${progresso}%" aria-valuenow="${progresso}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
        <div class="course-card-footer">
          <button class="btn btn-primary btn-assistir w-100" data-curso-id="${curso.id}">
            <i class="bi bi-play-fill me-2"></i>${progresso > 0 ? 'Continuar' : 'Começar'} Curso
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Event listeners dos cards
  grid.querySelectorAll('.btn-assistir').forEach(btn => {
    btn.addEventListener('click', () => {
      abrirCurso(Number(btn.dataset.cursoId));
    });
  });
}

// ── Player ────────────────────────────────────────────────────────────────────
export function abrirCurso(idCurso) {
  _cursoAtivo = idCurso;
  const curso = byId(db.cursos, idCurso);
  if (!curso) return;

  // Mostra view player, esconde catálogo
  document.getElementById('viewCatalogo').classList.add('d-none');
  document.getElementById('viewPlayer').classList.remove('d-none');
  document.getElementById('playerCursoTitulo').textContent = curso.titulo;

  renderSidebarAulas(idCurso);

  // Abre primeira aula disponível
  const modulos = db.modulos.filter(m => String(m.idCurso) === String(idCurso)).sort((a, b) => a.ordem - b.ordem);
  if (modulos.length > 0) {
    const primeiraAula = db.aulas.filter(a => String(a.idModulo) === String(modulos[0].id)).sort((a, b) => a.ordem - b.ordem)[0];
    if (primeiraAula) abrirAula(primeiraAula.id);
  } else {
    document.getElementById('playerContent').innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
        <i class="bi bi-film fs-1 mb-3 opacity-50"></i>
        <p>Este curso ainda não tem aulas cadastradas.</p>
      </div>`;
  }
}

export function renderSidebarAulas(idCurso) {
  const sidebar = document.getElementById('playerSidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  const modulos = db.modulos.filter(m => String(m.idCurso) === String(idCurso)).sort((a, b) => a.ordem - b.ordem);

  modulos.forEach(modulo => {
    const aulasMod = db.aulas.filter(a => String(a.idModulo) === String(modulo.id)).sort((a, b) => a.ordem - b.ordem);

    const modEl = document.createElement('div');
    modEl.className = 'sidebar-modulo';
    modEl.innerHTML = `
      <div class="sidebar-modulo-header">
        <i class="bi bi-folder2 me-2"></i>${modulo.titulo}
        <span class="ms-auto badge bg-secondary bg-opacity-30 text-secondary">${aulasMod.length}</span>
      </div>
      <ul class="sidebar-aulas-list list-unstyled mb-2">
        ${aulasMod.map(aula => `
          <li class="sidebar-aula-item ${isAulaConcluida(aula.id) ? 'concluida' : ''} ${String(aula.id) === String(_aulaAtiva) ? 'ativa' : ''}"
              data-aula-id="${aula.id}">
            <span class="aula-status-icon">
              ${isAulaConcluida(aula.id)
                ? '<i class="bi bi-check-circle-fill text-success"></i>'
                : '<i class="bi bi-play-circle text-accent"></i>'}
            </span>
            <span class="aula-titulo">${aula.titulo}</span>
            <span class="aula-duracao text-muted ms-auto">${aula.duracaoMinutos}min</span>
          </li>
        `).join('')}
      </ul>
    `;
    sidebar.appendChild(modEl);
  });

  // Eventos das aulas na sidebar
  sidebar.querySelectorAll('.sidebar-aula-item').forEach(item => {
    item.addEventListener('click', () => abrirAula(Number(item.dataset.aulaId)));
  });
}

export function abrirAula(idAula) {
  _aulaAtiva = idAula;
  const aula = byId(db.aulas, idAula);
  if (!aula) return;

  const content = document.getElementById('playerContent');
  const titulo = document.getElementById('playerAulaTitulo');
  const concluida = isAulaConcluida(idAula);

  if (titulo) titulo.textContent = aula.titulo;

  // Renderiza o player (YouTube embed ou video nativo)
  const isYoutube = aula.urlConteudo?.includes('youtube.com/embed') || aula.urlConteudo?.includes('youtu.be');
  if (content) {
    if (isYoutube) {
      content.innerHTML = `
        <iframe
          src="${aula.urlConteudo}"
          class="player-iframe"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="${aula.titulo}"
        ></iframe>`;
    } else {
      content.innerHTML = `
        <video class="player-video" controls>
          <source src="${aula.urlConteudo}" />
          Seu browser não suporta vídeo HTML5.
        </video>`;
    }
  }

  // Atualiza botão de conclusão
  const btnConcluir = document.getElementById('btnMarcarConcluida');
  if (btnConcluir) {
    btnConcluir.dataset.aulaId = idAula;
    if (concluida) {
      btnConcluir.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Concluída';
      btnConcluir.className = 'btn btn-success btn-sm';
      btnConcluir.disabled = true;
    } else {
      btnConcluir.innerHTML = '<i class="bi bi-check-circle me-2"></i>Marcar como concluída';
      btnConcluir.className = 'btn btn-outline-success btn-sm';
      btnConcluir.disabled = false;
    }
  }

  // Atualiza sidebar highlight
  document.querySelectorAll('.sidebar-aula-item').forEach(el => {
    el.classList.toggle('ativa', String(el.dataset.aulaId) === String(idAula));
  });
}

export function marcarConcluida(idAula) {
  if (!_idUsuario || !idAula) return;
  svc.atualizarProgresso(_idUsuario, idAula, 'Concluído');
  renderSidebarAulas(_cursoAtivo);
  abrirAula(idAula); // Atualiza estado do botão
}

export function voltarCatalogo() {
  _cursoAtivo = null;
  _aulaAtiva = null;
  document.getElementById('viewPlayer').classList.add('d-none');
  document.getElementById('viewCatalogo').classList.remove('d-none');
  renderCatalogo(); // Atualiza progresso dos cards
}
