import { ConteudoService } from '../service/ConteudoService.mjs';
import { refreshSelects } from './NavbarController.mjs';
import { showMessage, validateRequired } from '../utils.mjs';

const svc = new ConteudoService();

// ── Render: tabela Curso > Módulo > Aula ──────────────────────────────────────
export function renderConteudoTabela() {
  const body = document.getElementById('tabelaConteudoBody');
  body.innerHTML = '';
  const estrutura = svc.listarConteudo();

  estrutura.forEach(({ modulo, curso, aulas }) => {
    if (aulas.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${curso?.titulo || '—'}</td>
        <td>${modulo.titulo}</td>
        <td class="text-secondary">Sem aulas</td>
        <td>—</td>
        <td>${modulo.ordem}</td>
        <td>—</td>`;
      body.appendChild(row);
      return;
    }
    aulas.forEach(aula => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${curso?.titulo || '—'}</td>
        <td>${modulo.titulo}</td>
        <td>${aula.titulo}</td>
        <td>${aula.tipoConteudo}</td>
        <td>${aula.ordem}</td>
        <td>${aula.duracaoMinutos} min</td>`;
      body.appendChild(row);
    });
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────
export function initConteudoHandlers() {
  // Módulo
  document.getElementById('moduloForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#moduloCurso', '#moduloTitulo', '#moduloOrdem'])) {
      showMessage('Preencha os campos obrigatórios do módulo.', 'warning');
      return;
    }
    svc.salvarModulo(
      Number(document.getElementById('moduloCurso').value),
      document.getElementById('moduloTitulo').value.trim(),
      Number(document.getElementById('moduloOrdem').value)
    );
    form.reset();
    refreshSelects();
    renderConteudoTabela();
    showMessage('Módulo adicionado.');
  });

  // Aula
  document.getElementById('aulaForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#aulaModulo', '#aulaTitulo', '#aulaUrl', '#aulaDuracao', '#aulaOrdem'])) {
      showMessage('Preencha os campos obrigatórios da aula.', 'warning');
      return;
    }
    svc.salvarAula(
      Number(document.getElementById('aulaModulo').value),
      document.getElementById('aulaTitulo').value.trim(),
      document.getElementById('aulaTipo').value,
      document.getElementById('aulaUrl').value.trim(),
      Number(document.getElementById('aulaDuracao').value),
      Number(document.getElementById('aulaOrdem').value)
    );
    form.reset();
    refreshSelects();
    renderConteudoTabela();
    showMessage('Aula adicionada.');
  });
}
