import { db } from '../service/DbService.mjs';

// ── Navbar scroll / mobile ─────────────────────────────────────────────────────
export function initNavbar() {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('headerNav');
  const links = document.querySelectorAll('.header-link');
  if (!header || !toggle || !nav) return;

  const updateScrollState = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else if (!header.classList.contains('is-open')) {
      header.classList.remove('is-scrolled');
    }
  };

  const closeMenu = () => {
    header.classList.remove('is-open');
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', willOpen);
    header.classList.toggle('is-open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    if (!willOpen && window.scrollY <= 20) header.classList.remove('is-scrolled');
  });

  links.forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', updateScrollState);
  updateScrollState();
}

// ── Utilitário: popula um <select> ────────────────────────────────────────────
export function setSelectOptions(selectId, list, labelFn, valueKey = 'id', includePlaceholder = true) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const selectedValue = select.value;
  select.innerHTML = '';
  if (includePlaceholder) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Selecione...';
    select.appendChild(opt);
  }
  list.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = labelFn(item);
    select.appendChild(opt);
  });
  if ([...select.options].some(opt => opt.value === selectedValue)) {
    select.value = selectedValue;
  }
}

// ── Atualiza todos os <select> do HTML ────────────────────────────────────────
export function refreshSelects() {
  setSelectOptions('cursoInstrutor', db.usuarios, u => `${u.id} - ${u.nomeCompleto}`);
  setSelectOptions('cursoCategoria', db.categorias, c => `${c.id} - ${c.nome}`);
  setSelectOptions('filtroCategoria', db.categorias, c => c.nome, 'id', false);
  setSelectOptions('trilhaCategoria', db.categorias, c => c.nome);
  setSelectOptions('assocTrilha', db.trilhas, t => t.titulo);
  setSelectOptions('assocCurso', db.cursos, c => c.titulo);
  setSelectOptions('moduloCurso', db.cursos, c => c.titulo);
  setSelectOptions('aulaModulo', db.modulos, m => `${m.titulo} (Curso ${m.idCurso})`);
  setSelectOptions('matriculaUsuario', db.usuarios, u => u.nomeCompleto);
  setSelectOptions('matriculaCurso', db.cursos, c => c.titulo);
  setSelectOptions('progressoUsuario', db.usuarios, u => u.nomeCompleto);
  setSelectOptions('progressoAula', db.aulas, a => a.titulo);
  setSelectOptions('certificadoUsuario', db.usuarios, u => u.nomeCompleto);
  setSelectOptions('certificadoCurso', db.cursos, c => c.titulo);
  setSelectOptions('checkoutUsuario', db.usuarios, u => u.nomeCompleto);
  setSelectOptions('checkoutPlano', db.planos, p => `${p.nome} - R$ ${p.preco.toFixed(2)}`);
}
