/**
 * login.mjs — Entry point da tela de Login/Cadastro
 * Realiza o seed dos dados e gerencia o fluxo de autenticação.
 */
import { seedData } from './seed.mjs';
import { login, cadastrarAluno, getSession } from './controller/AuthController.mjs';

document.addEventListener('DOMContentLoaded', () => {
  // Seed dos dados iniciais
  seedData();

  // Se já há sessão ativa, redireciona direto
  const session = getSession();
  if (session) {
    redirectByRole(session.role);
    return;
  }

  // Ano no footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  const tabLogin = document.getElementById('tabLogin');
  const tabCadastro = document.getElementById('tabCadastro');
  const panelLogin = document.getElementById('panelLogin');
  const panelCadastro = document.getElementById('panelCadastro');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabCadastro.classList.remove('active');
    tabCadastro.setAttribute('aria-selected', 'false');
    panelLogin.classList.remove('d-none');
    panelCadastro.classList.add('d-none');
    clearAlert();
  });

  tabCadastro.addEventListener('click', () => {
    tabCadastro.classList.add('active');
    tabCadastro.setAttribute('aria-selected', 'true');
    tabLogin.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'false');
    panelCadastro.classList.remove('d-none');
    panelLogin.classList.add('d-none');
    clearAlert();
  });

  // ── Toggle senha ──────────────────────────────────────────────────────────────
  setupPasswordToggle('toggleLoginSenha', 'loginSenha');
  setupPasswordToggle('toggleCadastroSenha', 'cadastroSenha');

  // ── Botões Demo ───────────────────────────────────────────────────────────────
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('loginEmail').value = btn.dataset.email;
      document.getElementById('loginSenha').value = btn.dataset.senha;
      // Garante aba Login ativa
      tabLogin.click();
    });
  });

  // ── Form Login ────────────────────────────────────────────────────────────────
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;

    if (!email || !senha) {
      showAlert('Preencha e-mail e senha.', 'warning');
      return;
    }

    setLoading('btnEntrar', true);
    await fakeDelay(600);

    const result = login(email, senha);
    setLoading('btnEntrar', false);

    if (!result.ok) {
      showAlert(result.message, 'danger');
      return;
    }

    showAlert(`Bem-vindo, ${result.usuario.nomeCompleto}! Redirecionando...`, 'success');
    await fakeDelay(800);
    redirectByRole(result.usuario.role);
  });

  // ── Form Cadastro ─────────────────────────────────────────────────────────────
  document.getElementById('cadastroForm').addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('cadastroNome').value.trim();
    const email = document.getElementById('cadastroEmail').value.trim();
    const senha = document.getElementById('cadastroSenha').value;

    if (!nome || !email || !senha) {
      showAlert('Todos os campos são obrigatórios.', 'warning');
      return;
    }
    if (senha.length < 6) {
      showAlert('A senha deve ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    setLoading('btnCadastrar', true);
    await fakeDelay(700);

    const result = cadastrarAluno(nome, email, senha);
    setLoading('btnCadastrar', false);

    if (!result.ok) {
      showAlert(result.message, 'danger');
      return;
    }

    showAlert(`Conta criada! Bem-vindo, ${result.usuario.nomeCompleto}!`, 'success');
    await fakeDelay(800);
    redirectByRole(result.usuario.role);
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function redirectByRole(role) {
  window.location.href = role === 'admin' ? 'admin.html' : 'aluno.html';
}

function showAlert(message, type = 'danger') {
  const alert = document.getElementById('loginAlert');
  const iconMap = { success: 'check-circle-fill', danger: 'exclamation-triangle-fill', warning: 'info-circle-fill' };
  const icon = iconMap[type] || 'info-circle-fill';
  alert.className = `login-alert login-alert-${type}`;
  alert.innerHTML = `<i class="bi bi-${icon} me-2"></i>${message}`;
}

function clearAlert() {
  const alert = document.getElementById('loginAlert');
  alert.className = 'login-alert d-none';
  alert.textContent = '';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const label = btn.querySelector('.btn-label');
  const spinner = btn.querySelector('.spinner-border');
  btn.disabled = loading;
  label?.classList.toggle('d-none', loading);
  spinner?.classList.toggle('d-none', !loading);
}

function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.querySelector('i').className = isPass ? 'bi bi-eye-slash' : 'bi bi-eye';
  });
}

function fakeDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
