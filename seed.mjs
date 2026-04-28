/**
 * seed.mjs — Dados iniciais mínimos: apenas os usuários padrão.
 * Sem cursos, módulos ou aulas mock — o admin cadastra tudo pelo painel.
 */
import { db, counters, passwordHash, nowIso } from './service/DbService.mjs';
import { Usuario } from './model/Usuario.mjs';

export function seedData() {
  if (db.usuarios.length > 0) return; // Evita re-seed

  const admin = new Usuario(
    counters.usuario++,
    'Admin',
    'admin@plataforma.com',
    passwordHash('0202'),
    nowIso(),
    'admin'
  );

  const aluno = new Usuario(
    counters.usuario++,
    'Aluno',
    'aluno@plataforma.com',
    passwordHash('0202'),
    nowIso(),
    'aluno'
  );

  db.usuarios.push(admin, aluno);
}
