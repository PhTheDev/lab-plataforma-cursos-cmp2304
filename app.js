"use strict";

class Usuario {
  constructor(id, nomeCompleto, email, senhaHash, dataCadastro) {
    this.id = id;
    this.nomeCompleto = nomeCompleto;
    this.email = email;
    this.senhaHash = senhaHash;
    this.dataCadastro = dataCadastro;
  }
}

class Categoria {
  constructor(id, nome, descricao) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
  }
}

class Curso {
  constructor(id, titulo, descricao, idInstrutor, idCategoria, nivel, dataPublicacao, totalHoras) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.idInstrutor = idInstrutor;
    this.idCategoria = idCategoria;
    this.nivel = nivel;
    this.dataPublicacao = dataPublicacao;
    this.totalHoras = totalHoras;
  }
}

class Modulo {
  constructor(id, idCurso, titulo, ordem) {
    this.id = id;
    this.idCurso = idCurso;
    this.titulo = titulo;
    this.ordem = ordem;
  }
}

class Aula {
  constructor(id, idModulo, titulo, tipoConteudo, urlConteudo, duracaoMinutos, ordem) {
    this.id = id;
    this.idModulo = idModulo;
    this.titulo = titulo;
    this.tipoConteudo = tipoConteudo;
    this.urlConteudo = urlConteudo;
    this.duracaoMinutos = duracaoMinutos;
    this.ordem = ordem;
  }
}

class Matricula {
  constructor(id, idUsuario, idCurso, dataMatricula, dataConclusao = null) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idCurso = idCurso;
    this.dataMatricula = dataMatricula;
    this.dataConclusao = dataConclusao;
  }
}

class ProgressoAula {
  constructor(idUsuario, idAula, dataConclusao, status) {
    this.idUsuario = idUsuario;
    this.idAula = idAula;
    this.dataConclusao = dataConclusao;
    this.status = status;
  }
}

class Trilha {
  constructor(id, titulo, descricao, idCategoria) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.idCategoria = idCategoria;
  }
}

class TrilhaCurso {
  constructor(idTrilha, idCurso, ordem) {
    this.idTrilha = idTrilha;
    this.idCurso = idCurso;
    this.ordem = ordem;
  }
}

class Certificado {
  constructor(id, idUsuario, idCurso, codigoVerificacao, dataEmissao) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idCurso = idCurso;
    this.codigoVerificacao = codigoVerificacao;
    this.dataEmissao = dataEmissao;
  }
}

class Plano {
  constructor(id, nome, descricao, preco, duracaoMeses) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.duracaoMeses = duracaoMeses;
  }
}

class Assinatura {
  constructor(id, idUsuario, idPlano, dataInicio, dataFim) {
    this.id = id;
    this.idUsuario = idUsuario;
    this.idPlano = idPlano;
    this.dataInicio = dataInicio;
    this.dataFim = dataFim;
  }
}

class Pagamento {
  constructor(id, idAssinatura, valorPago, dataPagamento, metodoPagamento, idTransacaoGateway) {
    this.id = id;
    this.idAssinatura = idAssinatura;
    this.valorPago = valorPago;
    this.dataPagamento = dataPagamento;
    this.metodoPagamento = metodoPagamento;
    this.idTransacaoGateway = idTransacaoGateway;
  }
}

const db = {
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

const counters = {
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

const byId = (arr, id) => arr.find((item) => String(item.id) === String(id));
const nowIso = () => new Date().toISOString();
const formatDate = (iso) => new Date(iso).toLocaleString("pt-BR");
const passwordHash = (value) => btoa(unescape(encodeURIComponent(value)));

function initNavbar() {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("headerNav");
  const links = document.querySelectorAll(".header-link");
  if (!header || !toggle || !nav) return;

  const updateScrollState = () => {
    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else if (!header.classList.contains("is-open")) {
      header.classList.remove("is-scrolled");
    }
  };

  const closeMenu = () => {
    header.classList.remove("is-open");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const willOpen = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", willOpen);
    header.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    if (!willOpen && window.scrollY <= 20) {
      header.classList.remove("is-scrolled");
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("scroll", updateScrollState);
  updateScrollState();
}

function setSelectOptions(selectId, list, labelFn, valueKey = "id", includePlaceholder = true) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const selectedValue = select.value;
  select.innerHTML = "";
  if (includePlaceholder) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Selecione...";
    select.appendChild(option);
  }
  list.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueKey];
    option.textContent = labelFn(item);
    select.appendChild(option);
  });
  if ([...select.options].some((opt) => opt.value === selectedValue)) {
    select.value = selectedValue;
  }
}

function refreshSelects() {
  setSelectOptions("cursoInstrutor", db.usuarios, (u) => `${u.id} - ${u.nomeCompleto}`);
  setSelectOptions("cursoCategoria", db.categorias, (c) => `${c.id} - ${c.nome}`);
  setSelectOptions("filtroCategoria", db.categorias, (c) => `${c.nome}`, "id", false);
  setSelectOptions("trilhaCategoria", db.categorias, (c) => `${c.nome}`);
  setSelectOptions("assocTrilha", db.trilhas, (t) => `${t.titulo}`);
  setSelectOptions("assocCurso", db.cursos, (c) => `${c.titulo}`);
  setSelectOptions("moduloCurso", db.cursos, (c) => `${c.titulo}`);
  setSelectOptions("aulaModulo", db.modulos, (m) => `${m.titulo} (Curso ${m.idCurso})`);
  setSelectOptions("matriculaUsuario", db.usuarios, (u) => `${u.nomeCompleto}`);
  setSelectOptions("matriculaCurso", db.cursos, (c) => `${c.titulo}`);
  setSelectOptions("progressoUsuario", db.usuarios, (u) => `${u.nomeCompleto}`);
  setSelectOptions("progressoAula", db.aulas, (a) => `${a.titulo}`);
  setSelectOptions("certificadoUsuario", db.usuarios, (u) => `${u.nomeCompleto}`);
  setSelectOptions("certificadoCurso", db.cursos, (c) => `${c.titulo}`);
  setSelectOptions("checkoutUsuario", db.usuarios, (u) => `${u.nomeCompleto}`);
  setSelectOptions("checkoutPlano", db.planos, (p) => `${p.nome} - R$ ${p.preco.toFixed(2)}`);
}

function renderCursosCategoria(categoriaId) {
  const lista = document.getElementById("listaCursosCategoria");
  const cursos = db.cursos.filter((curso) => String(curso.idCategoria) === String(categoriaId));
  lista.innerHTML = "";
  if (cursos.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-secondary">Nenhum curso encontrado.</li>';
    return;
  }
  cursos.forEach((curso) => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = `${curso.titulo} - ${curso.nivel}`;
    lista.appendChild(item);
  });
}

function renderTrilhaCursos() {
  const lista = document.getElementById("listaTrilhaCursos");
  lista.innerHTML = "";
  if (db.trilhasCursos.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-secondary">Nenhuma associação criada.</li>';
    return;
  }
  const ordered = [...db.trilhasCursos].sort((a, b) => a.ordem - b.ordem);
  ordered.forEach((assoc) => {
    const trilha = byId(db.trilhas, assoc.idTrilha);
    const curso = byId(db.cursos, assoc.idCurso);
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = `${trilha?.titulo || "Trilha"} > ${curso?.titulo || "Curso"} (Ordem ${assoc.ordem})`;
    lista.appendChild(item);
  });
}

function renderConteudoTabela() {
  const body = document.getElementById("tabelaConteudoBody");
  body.innerHTML = "";
  const modulosOrdenados = [...db.modulos].sort((a, b) => a.ordem - b.ordem);
  modulosOrdenados.forEach((modulo) => {
    const curso = byId(db.cursos, modulo.idCurso);
    const aulas = db.aulas
      .filter((a) => String(a.idModulo) === String(modulo.id))
      .sort((a, b) => a.ordem - b.ordem);
    if (aulas.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${curso?.titulo || "-"}</td><td>${modulo.titulo}</td><td class="text-secondary">Sem aula</td><td>-</td><td>${modulo.ordem}</td><td>-</td>`;
      body.appendChild(row);
      return;
    }
    aulas.forEach((aula) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${curso?.titulo || "-"}</td><td>${modulo.titulo}</td><td>${aula.titulo}</td><td>${aula.tipoConteudo}</td><td>${aula.ordem}</td><td>${aula.duracaoMinutos} min</td>`;
      body.appendChild(row);
    });
  });
}

function renderMatriculas() {
  const lista = document.getElementById("listaMatriculas");
  lista.innerHTML = "";
  if (db.matriculas.length === 0) {
    lista.innerHTML = '<li class="list-group-item text-secondary">Nenhuma matrícula registrada.</li>';
    return;
  }
  db.matriculas.forEach((matricula) => {
    const usuario = byId(db.usuarios, matricula.idUsuario);
    const curso = byId(db.cursos, matricula.idCurso);
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = `${usuario?.nomeCompleto || "Usuário"} em ${curso?.titulo || "Curso"} (${formatDate(matricula.dataMatricula)})`;
    lista.appendChild(item);
  });
}

function renderProgresso() {
  const body = document.getElementById("tabelaProgressoBody");
  body.innerHTML = "";
  db.progressoAulas.forEach((progresso) => {
    const usuario = byId(db.usuarios, progresso.idUsuario);
    const aula = byId(db.aulas, progresso.idAula);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${usuario?.nomeCompleto || "-"}</td><td>${aula?.titulo || "-"}</td><td>${progresso.status}</td><td>${formatDate(progresso.dataConclusao)}</td>`;
    body.appendChild(row);
  });
}

function renderPagamentos() {
  const body = document.getElementById("tabelaPagamentosBody");
  body.innerHTML = "";
  db.pagamentos.forEach((pagamento) => {
    const assinatura = byId(db.assinaturas, pagamento.idAssinatura);
    const usuario = assinatura ? byId(db.usuarios, assinatura.idUsuario) : null;
    const plano = assinatura ? byId(db.planos, assinatura.idPlano) : null;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${usuario?.nomeCompleto || "-"}</td><td>${plano?.nome || "-"}</td><td>R$ ${pagamento.valorPago.toFixed(2)}</td><td>${pagamento.metodoPagamento}</td><td>${pagamento.idTransacaoGateway}</td><td>${formatDate(pagamento.dataPagamento)}</td>`;
    body.appendChild(row);
  });
}

function showMessage(text, type = "success") {
  const existing = document.getElementById("alertRuntime");
  if (existing) existing.remove();
  const main = document.querySelector("main");
  const div = document.createElement("div");
  div.id = "alertRuntime";
  div.className = `alert alert-${type} mt-2`;
  div.textContent = text;
  main.prepend(div);
  setTimeout(() => div.remove(), 2500);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRequired(form, fields) {
  for (const field of fields) {
    const input = form.querySelector(field);
    if (!input || !String(input.value).trim()) {
      return false;
    }
  }
  return true;
}

function attachHandlers() {
  document.getElementById("categoriaForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#categoriaNome"])) {
      showMessage("Preencha os campos obrigatórios da categoria.", "warning");
      return;
    }
    const nome = document.getElementById("categoriaNome").value.trim();
    if (db.categorias.some((categoria) => categoria.nome.toLowerCase() === nome.toLowerCase())) {
      showMessage("Categoria já existe.", "warning");
      return;
    }
    const categoria = new Categoria(
      counters.categoria++,
      nome,
      document.getElementById("categoriaDescricao").value.trim()
    );
    db.categorias.push(categoria);
    form.reset();
    refreshSelects();
    showMessage("Categoria cadastrada com sucesso.");
  });

  document.getElementById("usuarioForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#usuarioNome", "#usuarioEmail", "#usuarioSenha"])) {
      showMessage("Preencha os campos obrigatórios do usuário.", "warning");
      return;
    }
    const email = document.getElementById("usuarioEmail").value.trim();
    if (!validEmail(email)) {
      showMessage("Formato de e-mail inválido.", "warning");
      return;
    }
    if (db.usuarios.some((usuario) => usuario.email.toLowerCase() === email.toLowerCase())) {
      showMessage("E-mail já cadastrado.", "warning");
      return;
    }
    const usuario = new Usuario(
      counters.usuario++,
      document.getElementById("usuarioNome").value.trim(),
      email,
      passwordHash(document.getElementById("usuarioSenha").value.trim()),
      nowIso()
    );
    db.usuarios.push(usuario);
    form.reset();
    refreshSelects();
    showMessage("Usuário cadastrado com sucesso.");
  });

  document.getElementById("cursoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#cursoTitulo", "#cursoInstrutor", "#cursoCategoria"])) {
      showMessage("Preencha os campos obrigatórios do curso.", "warning");
      return;
    }
    const curso = new Curso(
      counters.curso++,
      document.getElementById("cursoTitulo").value.trim(),
      document.getElementById("cursoDescricao").value.trim(),
      Number(document.getElementById("cursoInstrutor").value),
      Number(document.getElementById("cursoCategoria").value),
      document.getElementById("cursoNivel").value,
      document.getElementById("cursoData").value || new Date().toISOString().slice(0, 10),
      Number(document.getElementById("cursoHoras").value || 0)
    );
    db.cursos.push(curso);
    form.reset();
    refreshSelects();
    showMessage("Curso cadastrado com sucesso.");
  });

  document.getElementById("btnFiltrarCursos").addEventListener("click", () => {
    const categoriaId = document.getElementById("filtroCategoria").value;
    if (!categoriaId) {
      showMessage("Cadastre e selecione uma categoria para filtrar.", "warning");
      return;
    }
    renderCursosCategoria(categoriaId);
  });

  document.getElementById("trilhaForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#trilhaTitulo", "#trilhaCategoria"])) {
      showMessage("Preencha os campos obrigatórios da trilha.", "warning");
      return;
    }
    const trilha = new Trilha(
      counters.trilha++,
      document.getElementById("trilhaTitulo").value.trim(),
      document.getElementById("trilhaDescricao").value.trim(),
      Number(document.getElementById("trilhaCategoria").value)
    );
    db.trilhas.push(trilha);
    form.reset();
    refreshSelects();
    showMessage("Trilha cadastrada com sucesso.");
  });

  document.getElementById("trilhaCursoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#assocTrilha", "#assocCurso", "#assocOrdem"])) {
      showMessage("Preencha os campos obrigatórios da associação.", "warning");
      return;
    }
    const assoc = new TrilhaCurso(
      Number(document.getElementById("assocTrilha").value),
      Number(document.getElementById("assocCurso").value),
      Number(document.getElementById("assocOrdem").value)
    );
    db.trilhasCursos.push(assoc);
    form.reset();
    renderTrilhaCursos();
    showMessage("Curso associado à trilha.");
  });

  document.getElementById("moduloForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#moduloCurso", "#moduloTitulo", "#moduloOrdem"])) {
      showMessage("Preencha os campos obrigatórios do módulo.", "warning");
      return;
    }
    const modulo = new Modulo(
      counters.modulo++,
      Number(document.getElementById("moduloCurso").value),
      document.getElementById("moduloTitulo").value.trim(),
      Number(document.getElementById("moduloOrdem").value)
    );
    db.modulos.push(modulo);
    form.reset();
    refreshSelects();
    renderConteudoTabela();
    showMessage("Módulo adicionado.");
  });

  document.getElementById("aulaForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#aulaModulo", "#aulaTitulo", "#aulaUrl", "#aulaDuracao", "#aulaOrdem"])) {
      showMessage("Preencha os campos obrigatórios da aula.", "warning");
      return;
    }
    const aula = new Aula(
      counters.aula++,
      Number(document.getElementById("aulaModulo").value),
      document.getElementById("aulaTitulo").value.trim(),
      document.getElementById("aulaTipo").value,
      document.getElementById("aulaUrl").value.trim(),
      Number(document.getElementById("aulaDuracao").value),
      Number(document.getElementById("aulaOrdem").value)
    );
    db.aulas.push(aula);
    form.reset();
    refreshSelects();
    renderConteudoTabela();
    showMessage("Aula adicionada.");
  });

  document.getElementById("matriculaForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#matriculaUsuario", "#matriculaCurso"])) {
      showMessage("Selecione usuário e curso.", "warning");
      return;
    }
    const matricula = new Matricula(
      counters.matricula++,
      Number(document.getElementById("matriculaUsuario").value),
      Number(document.getElementById("matriculaCurso").value),
      nowIso()
    );
    db.matriculas.push(matricula);
    form.reset();
    renderMatriculas();
    showMessage("Matrícula realizada.");
  });

  document.getElementById("progressoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#progressoUsuario", "#progressoAula"])) {
      showMessage("Selecione usuário e aula.", "warning");
      return;
    }
    const idUsuario = Number(document.getElementById("progressoUsuario").value);
    const idAula = Number(document.getElementById("progressoAula").value);
    const status = document.getElementById("progressoStatus").value;
    const existente = db.progressoAulas.find(
      (p) => String(p.idUsuario) === String(idUsuario) && String(p.idAula) === String(idAula)
    );
    if (existente) {
      existente.status = status;
      existente.dataConclusao = nowIso();
    } else {
      db.progressoAulas.push(new ProgressoAula(idUsuario, idAula, nowIso(), status));
    }
    form.reset();
    renderProgresso();
    showMessage("Progresso atualizado.");
  });

  document.getElementById("certificadoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#certificadoUsuario", "#certificadoCurso"])) {
      showMessage("Selecione usuário e curso para emitir certificado.", "warning");
      return;
    }
    const certificado = new Certificado(
      counters.certificado++,
      Number(document.getElementById("certificadoUsuario").value),
      Number(document.getElementById("certificadoCurso").value),
      `CERT-${Date.now().toString(36).toUpperCase()}`,
      nowIso()
    );
    db.certificados.push(certificado);
    const usuario = byId(db.usuarios, certificado.idUsuario);
    const curso = byId(db.cursos, certificado.idCurso);
    document.getElementById(
      "certificadoOutput"
    ).innerHTML = `<strong>${usuario?.nomeCompleto || "-"}</strong><br/>Concluiu o curso <strong>${curso?.titulo || "-"}</strong><br/>Código de verificação: <code>${certificado.codigoVerificacao}</code><br/>Emissão: ${formatDate(certificado.dataEmissao)}`;
    form.reset();
    showMessage("Certificado emitido.");
  });

  document.getElementById("planoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#planoNome", "#planoPreco", "#planoDuracao"])) {
      showMessage("Preencha os campos obrigatórios do plano.", "warning");
      return;
    }
    const plano = new Plano(
      counters.plano++,
      document.getElementById("planoNome").value.trim(),
      document.getElementById("planoDescricao").value.trim(),
      Number(document.getElementById("planoPreco").value),
      Number(document.getElementById("planoDuracao").value)
    );
    db.planos.push(plano);
    form.reset();
    refreshSelects();
    showMessage("Plano cadastrado.");
  });

  document.getElementById("checkoutForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form, ["#checkoutUsuario", "#checkoutPlano"])) {
      showMessage("Selecione usuário e plano para checkout.", "warning");
      return;
    }
    const idUsuario = Number(document.getElementById("checkoutUsuario").value);
    const idPlano = Number(document.getElementById("checkoutPlano").value);
    const plano = byId(db.planos, idPlano);
    if (!plano) {
      showMessage("Plano inválido.", "warning");
      return;
    }
    const inicio = new Date();
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + plano.duracaoMeses);
    const assinatura = new Assinatura(
      counters.assinatura++,
      idUsuario,
      idPlano,
      inicio.toISOString(),
      fim.toISOString()
    );
    db.assinaturas.push(assinatura);

    const pagamento = new Pagamento(
      counters.pagamento++,
      assinatura.id,
      plano.preco,
      nowIso(),
      document.getElementById("checkoutMetodo").value,
      `TXN-${Date.now().toString(36).toUpperCase()}`
    );
    db.pagamentos.push(pagamento);
    form.reset();
    renderPagamentos();
    showMessage("Checkout concluído e pagamento registrado.");
  });
}

function seedData() {
  const u1 = new Usuario(counters.usuario++, "Ana Instrutora", "ana@faculdade.edu", passwordHash("123456"), nowIso());
  const u2 = new Usuario(counters.usuario++, "Bruno Aluno", "bruno@faculdade.edu", passwordHash("123456"), nowIso());
  db.usuarios.push(u1, u2);

  const c1 = new Categoria(counters.categoria++, "Programação", "Cursos de desenvolvimento");
  db.categorias.push(c1);

  const curso = new Curso(
    counters.curso++,
    "JavaScript para Web",
    "Fundamentos e prática",
    u1.id,
    c1.id,
    "Iniciante",
    new Date().toISOString().slice(0, 10),
    20
  );
  db.cursos.push(curso);

  const plano = new Plano(counters.plano++, "Mensal", "Acesso à plataforma por 1 mês", 49.9, 1);
  db.planos.push(plano);
}

function init() {
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  initNavbar();
  seedData();
  attachHandlers();
  refreshSelects();
  renderCursosCategoria(db.categorias[0]?.id);
  renderTrilhaCursos();
  renderConteudoTabela();
  renderMatriculas();
  renderProgresso();
  renderPagamentos();
}

document.addEventListener("DOMContentLoaded", init);
