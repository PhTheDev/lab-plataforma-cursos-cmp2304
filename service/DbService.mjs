// Estado compartilhado entre todos os services (singleton em memória)
export const db = {
  usuarios: [],
  categorias: [],
  cursos: [],
  modulos: [],
  aulas: [],
  matriculas: [],
  progressoAulas: [],
  trilhas: [],
  trilhasCursos: [],
  certificados: [],
  planos: [],
  assinaturas: [],
  pagamentos: []
};

export const counters = {
  usuario: 1,
  categoria: 1,
  curso: 1,
  modulo: 1,
  aula: 1,
  matricula: 1,
  trilha: 1,
  certificado: 1,
  plano: 1,
  assinatura: 1,
  pagamento: 1
};

export const byId = (arr, id) => arr.find(item => String(item.id) === String(id));
export const nowIso = () => new Date().toISOString();
export const formatDate = (iso) => new Date(iso).toLocaleString('pt-BR');
export const passwordHash = (value) => btoa(unescape(encodeURIComponent(value)));
