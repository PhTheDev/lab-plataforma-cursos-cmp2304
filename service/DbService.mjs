/**
 * DbService.mjs — Estado compartilhado com persistência em localStorage.
 *
 * Estratégia:
 * 1. Ao inicializar, carrega dados salvos do localStorage.
 * 2. O método `push` de cada array é substituído para chamar saveDb() automaticamente.
 * 3. Os controllers não precisam de nenhuma alteração.
 */

const LS_DB_KEY       = 'ph_db_v1';
const LS_COUNTERS_KEY = 'ph_counters_v1';

// ── Estado em memória ──────────────────────────────────────────────────────────
export const db = {
  usuarios:      [],
  categorias:    [],
  cursos:        [],
  modulos:       [],
  aulas:         [],
  matriculas:    [],
  progressoAulas:[],
  trilhas:       [],
  trilhasCursos: [],
  certificados:  [],
  planos:        [],
  assinaturas:   [],
  pagamentos:    []
};

export const counters = {
  usuario:    1,
  categoria:  1,
  curso:      1,
  modulo:     1,
  aula:       1,
  matricula:  1,
  trilha:     1,
  certificado:1,
  plano:      1,
  assinatura: 1,
  pagamento:  1
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const byId    = (arr, id) => arr.find(item => String(item.id) === String(id));
export const nowIso  = () => new Date().toISOString();
export const formatDate = (iso) => new Date(iso).toLocaleString('pt-BR');
export const passwordHash = (value) => btoa(unescape(encodeURIComponent(value)));

// ── Persistência ──────────────────────────────────────────────────────────────
export function saveDb() {
  try {
    localStorage.setItem(LS_DB_KEY, JSON.stringify(db));
    localStorage.setItem(LS_COUNTERS_KEY, JSON.stringify(counters));
  } catch (e) {
    console.warn('[DbService] Falha ao salvar no localStorage:', e);
  }
}

export function clearDb() {
  localStorage.removeItem(LS_DB_KEY);
  localStorage.removeItem(LS_COUNTERS_KEY);
  location.reload();
}

function loadDb() {
  try {
    const rawDb = localStorage.getItem(LS_DB_KEY);
    if (rawDb) {
      const saved = JSON.parse(rawDb);
      // Popula os arrays em memória SEM substituí-los (mantém referências)
      Object.keys(db).forEach(key => {
        if (Array.isArray(saved[key]) && saved[key].length > 0) {
          // usa splice para não acionar o push monkeypatched durante o carregamento
          Array.prototype.splice.call(db[key], 0, 0, ...saved[key]);
        }
      });
    }

    const rawCounters = localStorage.getItem(LS_COUNTERS_KEY);
    if (rawCounters) {
      Object.assign(counters, JSON.parse(rawCounters));
    }
  } catch (e) {
    console.warn('[DbService] Falha ao carregar do localStorage:', e);
  }
}

/** Substitui o método push de cada array para acionar saveDb() automaticamente. */
function patchArrays() {
  Object.keys(db).forEach(key => {
    db[key].push = function (...args) {
      const result = Array.prototype.push.apply(this, args);
      saveDb();
      return result;
    };
  });
}

// ── Inicialização (executado uma única vez quando o módulo é importado) ────────
patchArrays();  // Faz o patch ANTES de carregar para que splice (não push) seja usado no load
loadDb();       // Restaura dados do localStorage
