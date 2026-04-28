import { AcademicoService } from '../service/AcademicoService.mjs';
import { db, byId } from '../service/DbService.mjs';
import { refreshSelects } from './NavbarController.mjs';
import { showMessage, validateRequired } from '../utils.mjs';

const svc = new AcademicoService();

// ── Renders ───────────────────────────────────────────────────────────────────
export function renderCursosCategoria(categoriaId) {
  const lista = document.getElementById('listaCursosCategoria');
  const cursos = svc.listarCursosPorCategoria(categoriaId);
  lista.innerHTML = '';
  if (cursos.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-secondary">Nenhum curso encontrado.</li>';
    return;
  }
  cursos.forEach(curso => {
    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.textContent = `${curso.titulo} — ${curso.nivel}`;
    lista.appendChild(item);
  });
}

export function renderTrilhaCursos() {
  const lista = document.getElementById('listaTrilhaCursos');
  lista.innerHTML = '';
  const ordered = svc.listarTrilhaCursos();
  if (ordered.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-secondary">Nenhuma associação criada.</li>';
    return;
  }
  ordered.forEach(assoc => {
    const trilha = byId(db.trilhas, assoc.idTrilha);
    const curso = byId(db.cursos, assoc.idCurso);
    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.textContent = `${trilha?.titulo || 'Trilha'} › ${curso?.titulo || 'Curso'} (Ordem ${assoc.ordem})`;
    lista.appendChild(item);
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────
export function initAcademicoHandlers() {
  // Categoria
  document.getElementById('categoriaForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#categoriaNome'])) {
      showMessage('Preencha os campos obrigatórios da categoria.', 'warning');
      return;
    }
    try {
      svc.salvarCategoria(
        document.getElementById('categoriaNome').value.trim(),
        document.getElementById('categoriaDescricao').value.trim()
      );
      form.reset();
      refreshSelects();
      showMessage('Categoria cadastrada com sucesso.');
    } catch (err) {
      showMessage(err.message, 'warning');
    }
  });

  // Curso
  document.getElementById('cursoForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#cursoTitulo', '#cursoInstrutor', '#cursoCategoria'])) {
      showMessage('Preencha os campos obrigatórios do curso.', 'warning');
      return;
    }
    svc.salvarCurso({
      titulo: document.getElementById('cursoTitulo').value.trim(),
      descricao: document.getElementById('cursoDescricao').value.trim(),
      idInstrutor: Number(document.getElementById('cursoInstrutor').value),
      idCategoria: Number(document.getElementById('cursoCategoria').value),
      nivel: document.getElementById('cursoNivel').value,
      dataPublicacao: document.getElementById('cursoData').value || new Date().toISOString().slice(0, 10),
      totalHoras: Number(document.getElementById('cursoHoras').value || 0),
      preco: Number(document.getElementById('cursoPreco')?.value || 0)
    });
    form.reset();
    refreshSelects();
    showMessage('Curso cadastrado com sucesso.');
  });

  // Filtro
  document.getElementById('btnFiltrarCursos').addEventListener('click', () => {
    const categoriaId = document.getElementById('filtroCategoria').value;
    if (!categoriaId) {
      showMessage('Cadastre e selecione uma categoria para filtrar.', 'warning');
      return;
    }
    renderCursosCategoria(categoriaId);
  });

  // Trilha
  document.getElementById('trilhaForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#trilhaTitulo', '#trilhaCategoria'])) {
      showMessage('Preencha os campos obrigatórios da trilha.', 'warning');
      return;
    }
    svc.salvarTrilha(
      document.getElementById('trilhaTitulo').value.trim(),
      document.getElementById('trilhaDescricao').value.trim(),
      Number(document.getElementById('trilhaCategoria').value)
    );
    form.reset();
    refreshSelects();
    showMessage('Trilha cadastrada com sucesso.');
  });

  // Associação Trilha-Curso
  document.getElementById('trilhaCursoForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#assocTrilha', '#assocCurso', '#assocOrdem'])) {
      showMessage('Preencha os campos obrigatórios da associação.', 'warning');
      return;
    }
    svc.associarCursoTrilha(
      Number(document.getElementById('assocTrilha').value),
      Number(document.getElementById('assocCurso').value),
      Number(document.getElementById('assocOrdem').value)
    );
    form.reset();
    renderTrilhaCursos();
    showMessage('Curso associado à trilha.');
  });
}
