/**
 * AuthController — gerencia sessão em sessionStorage
 * Sessão armazenada: { id, nomeCompleto, role }
 */
import { db, counters, passwordHash, nowIso, saveDb } from '../service/DbService.mjs';
import { Usuario } from '../model/Usuario.mjs';

const SESSION_KEY = 'ph_session';

// ── Sessão ─────────────────────────────────────────────────────────────────────
export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) ?? null;
  } catch {
    return null;
  }
}

export function setSession(usuario) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    id: usuario.id,
    nomeCompleto: usuario.nomeCompleto,
    role: usuario.role
  }));
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Chama no início de páginas protegidas.
 * @param {'aluno'|'admin'|null} role — null = qualquer role autenticado
 * @param {string} redirectTo — URL de fallback caso não autenticado
 * @returns {object|null} sessão ou null (com redirect já disparado)
 */
export function requireAuth(role = null, redirectTo = 'index.html') {
  const session = getSession();
  if (!session) {
    window.location.replace(redirectTo);
    return null;
  }
  // Admin pode acessar qualquer área; aluno só a sua
  if (role && session.role !== role && session.role !== 'admin') {
    window.location.replace(redirectTo);
    return null;
  }
  return session;
}

// ── Login ─────────────────────────────────────────────────────────────────────
/**
 * @returns {{ ok: true, usuario } | { ok: false, message: string }}
 */
export function login(email, senha) {
  const hash = passwordHash(senha);
  const usuario = db.usuarios.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.senhaHash === hash
  );
  if (!usuario) {
    return { ok: false, message: 'E-mail ou senha incorretos.' };
  }
  setSession(usuario);
  return { ok: true, usuario };
}

// ── Cadastro (alunos) ─────────────────────────────────────────────────────────
/**
 * @returns {{ ok: true, usuario } | { ok: false, message: string }}
 */
export function cadastrarAluno(nomeCompleto, email, senha) {
  if (db.usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, message: 'E-mail já cadastrado.' };
  }
  const u = new Usuario(
    counters.usuario++,
    nomeCompleto,
    email,
    passwordHash(senha),
    nowIso(),
    'aluno'
  );
  db.usuarios.push(u);
  setSession(u);
  return { ok: true, usuario: u };
}
