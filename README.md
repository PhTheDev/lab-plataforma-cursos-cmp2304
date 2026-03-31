# LAB03 - Plataforma de Cursos Online

Projeto desenvolvido para a disciplina da faculdade com foco em:

- estruturacao semantica com HTML5
- estilizacao responsiva com Bootstrap 5
- manipulacao dinamica com JavaScript (ES6+)
- simulacao de persistencia em memoria

## Sobre o projeto

Esta aplicacao simula uma plataforma de cursos online com modulos academico, de conteudo, usuarios/progresso e financeiro.

O sistema foi implementado sem backend, com dados armazenados em arrays em memoria, usando classes JavaScript para representar as entidades do modelo de dados.

## Tecnologias utilizadas

- HTML5
- CSS3
- Bootstrap 5 (CDN)
- JavaScript ES6+

## Funcionalidades implementadas

### 1) Modulo Academico e Curadoria
- Cadastro de categorias
- Cadastro de cursos
- Filtro de cursos por categoria
- Cadastro de trilhas
- Associacao de cursos em trilhas com campo de ordem

### 2) Modulo de Conteudo
- Cadastro de modulos por curso
- Cadastro de aulas por modulo
- Visualizacao da estrutura Curso > Modulo > Aula em tabela

### 3) Modulo de Usuarios e Progresso
- Cadastro de usuarios com validacao de email e unicidade
- Matricula de usuario em curso
- Atualizacao de progresso por aula
- Emissao visual de certificado com codigo de verificacao

### 4) Modulo Financeiro
- Cadastro de planos
- Checkout simples (usuario + plano + metodo)
- Geracao de assinatura
- Registro de pagamento com ID de transacao

## Regras e validacoes aplicadas

- Campos obrigatorios nos formularios
- Validacao basica de formato de email
- Verificacao de duplicidade para email de usuario e nome de categoria
- Atualizacao de progresso sem duplicar combinacao usuario/aula

## Estrutura do projeto

```txt
htmlfacu/
  index.html      # Estrutura da interface
  styles.css      # Estilos customizados (tema e componentes)
  app.js          # Logica da aplicacao (classes, eventos, renderizacao)
  README.md
```

## Como executar

Como o projeto usa apenas arquivos estaticos, basta abrir o `index.html` no navegador.

Opcionalmente, voce pode usar uma extensao de servidor local (ex.: Live Server) para desenvolvimento.

## Layout e identidade visual

- Header e Footer no estilo do portfolio pessoal
- Tema dark com destaque em azul/ciano
- Interface responsiva para desktop e mobile

## Observacoes importantes

- Nao ha banco de dados; os dados sao perdidos ao recarregar a pagina.
- O `SenhaHash` foi simulado para fins academicos.
- Este projeto foi desenvolvido para atender aos requisitos do LAB03.

## Autor

Pedro Henrique Faria dos Santos Soares: Eng. de Software e Aluno de Eng. da computação


