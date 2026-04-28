/**
 * aluno.mjs — Entry point do Painel do Aluno
 */
import { seedData } from './seed.mjs';
import { requireAuth, logout } from './controller/AuthController.mjs';
import {
  setUsuario, renderCatalogo, abrirCurso,
  abrirAula, marcarConcluida, voltarCatalogo
} from './controller/AlunoController.mjs';

document.addEventListener('DOMContentLoaded', () => {
  // Protege rota — qualquer usuário autenticado pode acessar
  const session = requireAuth(null, 'index.html');
  if (!session) return;

  // Seed compartilhado
  seedData();

  // Injeta nome do aluno na navbar
  const nameEl = document.getElementById('alunoUserName');
  if (nameEl) nameEl.textContent = session.nomeCompleto;

  // Se for admin, exibe link para o painel
  if (session.role === 'admin') {
    const adminLink = document.getElementById('adminPanelLink');
    if (adminLink) adminLink.classList.remove('d-none');
  }

  // Ano no footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Botão sair
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
  });

  // Botão voltar ao catálogo
  document.getElementById('btnVoltarCatalogo')?.addEventListener('click', voltarCatalogo);

  // Botão marcar aula concluída
  document.getElementById('btnMarcarConcluida')?.addEventListener('click', e => {
    const idAula = Number(e.currentTarget.dataset.aulaId);
    marcarConcluida(idAula);
  });

  // Define o usuário logado no controller
  setUsuario(session.id);

  // Render inicial do catálogo
  renderCatalogo();
});
