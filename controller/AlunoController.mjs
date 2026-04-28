/**
 * AlunoController.mjs — Catálogo de cursos, billing/checkout e player de aulas
 */
import { db, counters, byId, nowIso, saveDb } from '../service/DbService.mjs';
import { UsuarioService } from '../service/UsuarioService.mjs';
import { Pagamento } from '../model/Pagamento.mjs';

const svc = new UsuarioService();

// ── Estado local ───────────────────────────────────────────────────────────────
let _idUsuario = null;
let _cursoAtivo = null;
let _aulaAtiva = null;

export function setUsuario(id) {
  _idUsuario = Number(id);
}

// ── Utilitários ────────────────────────────────────────────────────────────────
function isMatriculado(idCurso) {
  return db.matriculas.some(
    m => String(m.idUsuario) === String(_idUsuario) &&
         String(m.idCurso) === String(idCurso)
  );
}

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

function formatPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    const matriculado = isMatriculado(curso.id);
    const progresso = matriculado ? getProgressoCurso(curso.id) : 0;
    const instrutor = byId(db.usuarios, curso.idInstrutor);
    const categoria = byId(db.categorias, curso.idCategoria);
    const aulas = db.aulas.filter(a =>
      db.modulos.filter(m => String(m.idCurso) === String(curso.id)).some(m => String(m.id) === String(a.idModulo))
    );

    const preco = Number(curso.preco) || 0;
    const gratuito = preco === 0;

    const badgeColor = {
      'Iniciante': 'success',
      'Intermediário': 'warning',
      'Avançado': 'danger'
    }[curso.nivel] || 'secondary';

    // Botão do footer: depende se já comprou ou não
    let footerBtn = '';
    if (matriculado) {
      footerBtn = `
        <button class="btn btn-primary btn-assistir w-100" data-curso-id="${curso.id}">
          <i class="bi bi-play-fill me-2"></i>${progresso > 0 ? 'Continuar' : 'Começar'} Curso
        </button>`;
    } else if (gratuito) {
      footerBtn = `
        <button class="btn btn-success btn-assistir w-100" data-buy-id="${curso.id}">
          <i class="bi bi-unlock me-2"></i>Acessar Gratuitamente
        </button>`;
    } else {
      footerBtn = `
        <button class="btn btn-accent btn-assistir w-100" data-buy-id="${curso.id}">
          <i class="bi bi-cart-check me-2"></i>Comprar por ${formatPreco(preco)}
        </button>`;
    }

    // Preço tag
    const precoTag = matriculado
      ? `<span class="course-price-tag owned"><i class="bi bi-check-circle-fill me-1"></i>Adquirido</span>`
      : gratuito
        ? `<span class="course-price-tag free">Gratuito</span>`
        : `<span class="course-price-tag">${formatPreco(preco)}</span>`;

    const card = document.createElement('div');
    card.className = 'col-12 col-md-6 col-xl-4';
    card.innerHTML = `
      <div class="course-card h-100">
        <div class="course-card-header">
          <div class="course-icon">
            <i class="bi bi-play-circle-fill"></i>
          </div>
          <div class="d-flex align-items-center gap-2">
            ${precoTag}
            <span class="badge bg-${badgeColor} bg-opacity-25 text-${badgeColor === 'warning' ? 'warning' : badgeColor} border border-${badgeColor} border-opacity-50">${curso.nivel}</span>
          </div>
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
          ${matriculado ? `
          <div class="course-progress-wrap mt-3">
            <div class="d-flex justify-content-between mb-1">
              <small class="text-muted">Progresso</small>
              <small class="fw-semibold text-accent">${progresso}%</small>
            </div>
            <div class="progress course-progress-bar">
              <div class="progress-bar" role="progressbar" style="width:${progresso}%" aria-valuenow="${progresso}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>` : ''}
        </div>
        <div class="course-card-footer">
          ${footerBtn}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Event listeners — Assistir cursos comprados
  grid.querySelectorAll('[data-curso-id]').forEach(btn => {
    btn.addEventListener('click', () => abrirCurso(Number(btn.dataset.cursoId)));
  });

  // Event listeners — Comprar curso
  grid.querySelectorAll('[data-buy-id]').forEach(btn => {
    btn.addEventListener('click', () => abrirCheckout(Number(btn.dataset.buyId)));
  });
}

// ── Checkout / Billing ────────────────────────────────────────────────────────
export function abrirCheckout(idCurso) {
  const curso = byId(db.cursos, idCurso);
  if (!curso) return;

  const preco = Number(curso.preco) || 0;
  const gratuito = preco === 0;
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;

  // Preenche dados
  document.getElementById('checkoutCursoTitulo').textContent = curso.titulo;
  document.getElementById('checkoutCursoDesc').textContent = curso.descricao || '';
  document.getElementById('checkoutCursoNivel').textContent = curso.nivel;
  document.getElementById('checkoutCursoHoras').textContent = `${curso.totalHoras}h`;

  const totalEl = document.getElementById('checkoutTotal');
  totalEl.textContent = gratuito ? 'GRÁTIS' : formatPreco(preco);

  // Esconde/mostra seção de pagamento
  const paySection = document.getElementById('checkoutPaySection');
  paySection.classList.toggle('d-none', gratuito);

  const btnLabel = document.getElementById('checkoutBtnLabel');
  btnLabel.textContent = gratuito ? 'Confirmar Inscrição' : `Pagar ${formatPreco(preco)}`;

  // Salva ID do curso no botão
  document.getElementById('btnConfirmarCompra').dataset.cursoId = idCurso;

  // Abre modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

export function confirmarCompra() {
  const btn = document.getElementById('btnConfirmarCompra');
  const idCurso = Number(btn.dataset.cursoId);
  const curso = byId(db.cursos, idCurso);
  if (!curso || !_idUsuario) return;

  const preco = Number(curso.preco) || 0;
  const metodo = document.querySelector('[name="checkoutMetodoRadio"]:checked')?.value || 'PIX';

  // 1. Cria matrícula
  svc.matricular(_idUsuario, idCurso);

  // 2. Se é pago, registra pagamento
  if (preco > 0) {
    const pagamento = new Pagamento(
      counters.pagamento++,
      null, // sem assinatura — é compra avulsa
      preco,
      nowIso(),
      metodo,
      `TXN-${Date.now().toString(36).toUpperCase()}`
    );
    db.pagamentos.push(pagamento);
  }

  // 3. Fecha modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
  modal?.hide();

  // 4. Mostra feedback
  mostrarToast(preco > 0
    ? `Compra realizada! ${formatPreco(preco)} via ${metodo}`
    : 'Inscrição confirmada!'
  );

  // 5. Re-renderiza catálogo
  renderCatalogo();
}

function mostrarToast(msg) {
  // Remove toast anterior se existir
  document.getElementById('alunoToast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'alunoToast';
  toast.className = 'aluno-toast';
  toast.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${msg}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Player ────────────────────────────────────────────────────────────────────
export function abrirCurso(idCurso) {
  _cursoAtivo = idCurso;
  const curso = byId(db.cursos, idCurso);
  if (!curso) return;

  document.getElementById('viewCatalogo').classList.add('d-none');
  document.getElementById('viewPlayer').classList.remove('d-none');
  document.getElementById('playerCursoTitulo').textContent = curso.titulo;

  renderSidebarAulas(idCurso);

  // Abre primeira aula
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

  document.querySelectorAll('.sidebar-aula-item').forEach(el => {
    el.classList.toggle('ativa', String(el.dataset.aulaId) === String(idAula));
  });
}

export function marcarConcluida(idAula) {
  if (!_idUsuario || !idAula) return;
  svc.atualizarProgresso(_idUsuario, idAula, 'Concluído');
  renderSidebarAulas(_cursoAtivo);
  abrirAula(idAula);
}

export function voltarCatalogo() {
  _cursoAtivo = null;
  _aulaAtiva = null;
  document.getElementById('viewPlayer').classList.add('d-none');
  document.getElementById('viewCatalogo').classList.remove('d-none');
  renderCatalogo();
}
