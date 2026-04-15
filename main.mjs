import { db, counters, passwordHash, nowIso } from './service/DbService.mjs';
import { Usuario } from './model/Usuario.mjs';
import { Categoria } from './model/Categoria.mjs';
import { Curso } from './model/Curso.mjs';
import { Plano } from './model/Plano.mjs';

import { initNavbar, refreshSelects } from './controller/NavbarController.mjs';
import { initAcademicoHandlers, renderCursosCategoria, renderTrilhaCursos } from './controller/AcademicoController.mjs';
import { initConteudoHandlers, renderConteudoTabela } from './controller/ConteudoController.mjs';
import { initUsuarioHandlers, renderMatriculas, renderProgresso } from './controller/UsuarioController.mjs';
import { initFinanceiroHandlers, renderPagamentos } from './controller/FinanceiroController.mjs';

// ── Dados iniciais (seed) ─────────────────────────────────────────────────────
function seedData() {
  const u1 = new Usuario(counters.usuario++, 'Ana Instrutora', 'ana@faculdade.edu', passwordHash('123456'), nowIso());
  const u2 = new Usuario(counters.usuario++, 'Bruno Aluno', 'bruno@faculdade.edu', passwordHash('123456'), nowIso());
  db.usuarios.push(u1, u2);

  const c1 = new Categoria(counters.categoria++, 'Programação', 'Cursos de desenvolvimento');
  db.categorias.push(c1);

  const curso = new Curso(
    counters.curso++,
    'JavaScript para Web',
    'Fundamentos e prática',
    u1.id, c1.id,
    'Iniciante',
    new Date().toISOString().slice(0, 10),
    20
  );
  db.cursos.push(curso);

  const plano = new Plano(counters.plano++, 'Mensal', 'Acesso à plataforma por 1 mês', 49.9, 1);
  db.planos.push(plano);
}

// ── Inicialização ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initNavbar();
  seedData();

  // Registra todos os event listeners
  initAcademicoHandlers();
  initConteudoHandlers();
  initUsuarioHandlers();
  initFinanceiroHandlers();

  // Popula selects e renderiza listagens iniciais
  refreshSelects();
  renderCursosCategoria(db.categorias[0]?.id);
  renderTrilhaCursos();
  renderConteudoTabela();
  renderMatriculas();
  renderProgresso();
  renderPagamentos();
});
