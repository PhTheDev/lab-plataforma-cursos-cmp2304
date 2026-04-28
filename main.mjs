/**
 * main.mjs — Entry point do Painel Administrativo (admin.html)
 * Realiza seed de dados e inicializa todos os controllers do admin.
 */
import { db, clearDb } from './service/DbService.mjs';
import { seedData } from './seed.mjs';
import { requireAuth, logout } from './controller/AuthController.mjs';

import { initNavbar, refreshSelects } from './controller/NavbarController.mjs';
import { initAcademicoHandlers, renderCursosCategoria, renderTrilhaCursos } from './controller/AcademicoController.mjs';
import { initConteudoHandlers, renderConteudoTabela } from './controller/ConteudoController.mjs';
import { initUsuarioHandlers, renderMatriculas, renderProgresso } from './controller/UsuarioController.mjs';
import { initFinanceiroHandlers, renderPagamentos } from './controller/FinanceiroController.mjs';

document.addEventListener('DOMContentLoaded', () => {
  // Protege rota: só admin pode acessar
  const session = requireAuth('admin', 'index.html');
  if (!session) return;

  // Seed compartilhado
  seedData();

  // Exibe nome do usuário logado na navbar
  const adminName = document.getElementById('adminUserName');
  if (adminName) adminName.textContent = session.nomeCompleto;

  // Ano no footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Botão sair
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
  });

  // Botão limpar todos os dados
  document.getElementById('btnClearDb')?.addEventListener('click', () => {
    if (confirm('⚠️ Isso vai apagar TODOS os dados cadastrados (cursos, aulas, usuários, etc.) e recarregar a página. Continuar?')) {
      logout();
      clearDb(); // limpa localStorage e recarrega
    }
  });

  // Inicializa todos os modules do admin
  initNavbar();
  initAcademicoHandlers();
  initConteudoHandlers();
  initUsuarioHandlers();
  initFinanceiroHandlers();

  refreshSelects();
  renderCursosCategoria(db.categorias[0]?.id);
  renderTrilhaCursos();
  renderConteudoTabela();
  renderMatriculas();
  renderProgresso();
  renderPagamentos();

  // Atualiza chips de estatísticas
  updateStats();

  // Re-atualiza stats quando qualquer form do admin é submetido
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => setTimeout(updateStats, 50));
  });
});

function updateStats() {
  const sc = document.getElementById('statCursos');
  const su = document.getElementById('statUsuarios');
  const sa = document.getElementById('statAulas');
  if (sc) sc.textContent = db.cursos.length;
  if (su) su.textContent = db.usuarios.length;
  if (sa) sa.textContent = db.aulas.length;
}
