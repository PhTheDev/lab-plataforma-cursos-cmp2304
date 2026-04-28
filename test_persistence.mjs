/**
 * test_persistence.mjs — Script de teste para verificar se a persistência funciona.
 * Abra o console do browser e rode: import('./test_persistence.mjs')
 */
import { db, counters, saveDb } from './service/DbService.mjs';

console.log('=== TESTE DE PERSISTÊNCIA ===');
console.log('');

// 1. Estado atual
console.log('1. Estado dos arrays em memória:');
Object.keys(db).forEach(k => {
  if (db[k].length > 0) {
    console.log(`   db.${k}: ${db[k].length} itens`);
  }
});
console.log(`   counters:`, { ...counters });

// 2. Estado do localStorage
const raw = localStorage.getItem('ph_db_v1');
if (raw) {
  const saved = JSON.parse(raw);
  console.log('');
  console.log('2. Estado no localStorage:');
  Object.keys(saved).forEach(k => {
    if (saved[k].length > 0) {
      console.log(`   ${k}: ${saved[k].length} itens`);
    }
  });
  
  // 3. Comparar aulas
  if (saved.aulas?.length > 0) {
    console.log('');
    console.log('3. Aulas salvas:');
    saved.aulas.forEach(a => {
      console.log(`   ID=${a.id}, Título="${a.titulo}", URL="${a.urlConteudo}"`);
    });
  }
} else {
  console.log('2. localStorage VAZIO — nenhum dado salvo!');
}

// 4. Teste de push
console.log('');
console.log('4. Testando se push aciona saveDb()...');
const testKey = '__ph_push_test';
const before = localStorage.getItem('ph_db_v1');
db.usuarios.push({ id: 9999, nomeCompleto: testKey, email: 'test@test', senhaHash: 'x', dataCadastro: '', role: 'aluno' });
const after = localStorage.getItem('ph_db_v1');
const afterParsed = JSON.parse(after);
const found = afterParsed.usuarios.find(u => u.nomeCompleto === testKey);
console.log(`   Push salvou no localStorage? ${found ? '✅ SIM' : '❌ NÃO'}`);

// Limpar teste
db.usuarios.splice(db.usuarios.findIndex(u => u.id === 9999), 1);
saveDb();
console.log('   (item de teste removido)');

console.log('');
console.log('=== FIM DO TESTE ===');
