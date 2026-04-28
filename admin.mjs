/**
 * admin.mjs — Entry point do Painel Administrativo
 * Importa seedData do main.mjs (dados compartilhados) e inicializa os controllers.
 */
import { db } from './service/DbService.mjs';
import { requireAuth, logout } from './controller/AuthController.mjs';
import { seedData } from './main.mjs';

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
});
