/**
 * DbService.mjs — Estado compartilhado com persistência em localStorage.
 *
 * Ordem de inicialização (IMPORTANTE):
 *  1. loadDb()   → lê localStorage e SUBSTITUI as referências de array dentro de `db`
 *  2. patchArrays() → intercepta o push dos arrays ATUAIS (já substituídos pelo load)
 *
 * Resultado: qualquer db.*.push() dispara saveDb() automaticamente.
 *            Controllers não precisam mudar.
 */

const LS_DB  = 'ph_db_v3';
const LS_CTR = 'ph_counters_v3';

// ── Estado em memória ──────────────────────────────────────────────────────────
export const db = {
  usuarios:       [],
  categorias:     [],
  cursos:         [],
  modulos:        [],
  aulas:          [],
  matriculas:     [],
  progressoAulas: [],
  trilhas:        [],
  trilhasCursos:  [],
  certificados:   [],
  planos:         [],
  assinaturas:    [],
  pagamentos:     []
};

export const counters = {
  usuario: 1, categoria: 1, curso: 1, modulo: 1,
  aula: 1, matricula: 1, trilha: 1, certificado: 1,
  plano: 1, assinatura: 1, pagamento: 1
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const byId       = (arr, id) => arr.find(i => String(i.id) === String(id));
export const nowIso     = () => new Date().toISOString();
export const formatDate = (iso) => new Date(iso).toLocaleString('pt-BR');
export const passwordHash = (v) => btoa(unescape(encodeURIComponent(v)));

// ── Persistência ──────────────────────────────────────────────────────────────
export function saveDb() {
  try {
    // Cria snapshot com arrays simples para garantir serialização correta
    const snapshot = {};
    Object.keys(db).forEach(k => { snapshot[k] = db[k].slice(); });
    localStorage.setItem(LS_DB,  JSON.stringify(snapshot));
    localStorage.setItem(LS_CTR, JSON.stringify({ ...counters }));
  } catch (e) {
    console.warn('[PhDB] Erro ao salvar:', e);
  }
}

export function clearDb() {
  localStorage.removeItem(LS_DB);
  localStorage.removeItem(LS_CTR);
  location.reload();
}

// ── PASSO 1: Carrega do localStorage ─────────────────────────────────────────
// Substitui as referências de array DENTRO do objeto db.
// Os módulos importam `db` pelo objeto, então db.usuarios passa a apontar
// para o array carregado — sem quebrar nenhuma referência externa.
;(function loadDb() {
  try {
    const rawDb  = localStorage.getItem(LS_DB);
    const rawCtr = localStorage.getItem(LS_CTR);

    if (rawDb) {
      const saved = JSON.parse(rawDb);
      Object.keys(db).forEach(key => {
        if (Array.isArray(saved[key])) {
          db[key] = saved[key]; // substitui o array em memória
        }
      });
    }

    if (rawCtr) {
      Object.assign(counters, JSON.parse(rawCtr));
    }
  } catch (e) {
    console.warn('[PhDB] Erro ao carregar:', e);
  }
}());

// ── PASSO 2: Intercepta push dos arrays atuais ───────────────────────────────
// Deve rodar DEPOIS do loadDb, pois loadDb pode ter substituído os arrays.
;(function patchArrays() {
  Object.keys(db).forEach(key => {
    db[key].push = function (...args) {
      const result = Array.prototype.push.apply(this, args);
      saveDb();          // salva toda vez que qualquer array recebe um item
      return result;
    };
  });
}());
