/**
 * Utilitários compartilhados entre controllers.
 */

export function showMessage(text, type = 'success') {
  const existing = document.getElementById('alertRuntime');
  if (existing) existing.remove();
  const main = document.querySelector('main');
  const div = document.createElement('div');
  div.id = 'alertRuntime';
  div.className = `alert alert-${type} mt-2`;
  div.textContent = text;
  main.prepend(div);
  setTimeout(() => div.remove(), 2500);
}

export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRequired(form, fields) {
  for (const field of fields) {
    const input = form.querySelector(field);
    if (!input || !String(input.value).trim()) return false;
  }
  return true;
}
