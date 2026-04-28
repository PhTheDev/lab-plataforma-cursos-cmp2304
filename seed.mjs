/**
 * seed.mjs — Dados iniciais: usuários padrão + cursos demo com preço.
 */
import { db, counters, passwordHash, nowIso } from './service/DbService.mjs';
import { Usuario } from './model/Usuario.mjs';
import { Categoria } from './model/Categoria.mjs';
import { Curso } from './model/Curso.mjs';
import { Modulo } from './model/Modulo.mjs';
import { Aula } from './model/Aula.mjs';

export function seedData() {
  if (db.usuarios.length > 0) return; // Evita re-seed

  // Usuários
  const admin = new Usuario(counters.usuario++, 'Admin', 'admin@plataforma.com', passwordHash('0202'), nowIso(), 'admin');
  const aluno = new Usuario(counters.usuario++, 'Aluno', 'aluno@plataforma.com', passwordHash('0202'), nowIso(), 'aluno');
  db.usuarios.push(admin, aluno);

  // Categoria
  const cat = new Categoria(counters.categoria++, 'Programação', 'Cursos de desenvolvimento web');
  db.categorias.push(cat);

  // Curso 1 — com preço
  const curso1 = new Curso(
    counters.curso++,
    'JavaScript Essencial',
    'Aprenda os fundamentos do JavaScript moderno para desenvolvimento web.',
    admin.id, cat.id, 'Iniciante',
    new Date().toISOString().slice(0, 10), 10,
    49.90 // preço
  );
  db.cursos.push(curso1);

  // Curso 2 — gratuito
  const curso2 = new Curso(
    counters.curso++,
    'HTML & CSS para Iniciantes',
    'Construa suas primeiras páginas web do zero com HTML5 e CSS3.',
    admin.id, cat.id, 'Iniciante',
    new Date().toISOString().slice(0, 10), 8,
    0 // gratuito
  );
  db.cursos.push(curso2);

  // Módulo + Aula do curso 1
  const mod1 = new Modulo(counters.modulo++, curso1.id, 'Introdução ao JavaScript', 1);
  db.modulos.push(mod1);

  const aula1 = new Aula(
    counters.aula++, mod1.id,
    'Primeiros Passos com JS',
    'Vídeo',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    10, 1
  );
  db.aulas.push(aula1);

  // Módulo + Aula do curso 2
  const mod2 = new Modulo(counters.modulo++, curso2.id, 'Estrutura HTML', 1);
  db.modulos.push(mod2);

  const aula2 = new Aula(
    counters.aula++, mod2.id,
    'Tags Essenciais do HTML',
    'Vídeo',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    12, 1
  );
  db.aulas.push(aula2);
}
