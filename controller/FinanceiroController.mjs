import { FinanceiroService } from '../service/FinanceiroService.mjs';
import { db, byId, formatDate } from '../service/DbService.mjs';
import { refreshSelects } from './NavbarController.mjs';
import { showMessage, validateRequired } from '../utils.mjs';

const svc = new FinanceiroService();

// ── Render: tabela de pagamentos ──────────────────────────────────────────────
export function renderPagamentos() {
  const body = document.getElementById('tabelaPagamentosBody');
  body.innerHTML = '';
  db.pagamentos.forEach(pag => {
    const assinatura = byId(db.assinaturas, pag.idAssinatura);
    const usuario = assinatura ? byId(db.usuarios, assinatura.idUsuario) : null;
    const plano = assinatura ? byId(db.planos, assinatura.idPlano) : null;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${usuario?.nomeCompleto || '—'}</td>
      <td>${plano?.nome || '—'}</td>
      <td>R$ ${pag.valorPago.toFixed(2)}</td>
      <td>${pag.metodoPagamento}</td>
      <td>${pag.idTransacaoGateway}</td>
      <td>${formatDate(pag.dataPagamento)}</td>`;
    body.appendChild(row);
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────
export function initFinanceiroHandlers() {
  // Plano
  document.getElementById('planoForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#planoNome', '#planoPreco', '#planoDuracao'])) {
      showMessage('Preencha os campos obrigatórios do plano.', 'warning');
      return;
    }
    svc.salvarPlano(
      document.getElementById('planoNome').value.trim(),
      document.getElementById('planoDescricao').value.trim(),
      Number(document.getElementById('planoPreco').value),
      Number(document.getElementById('planoDuracao').value)
    );
    form.reset();
    refreshSelects();
    showMessage('Plano cadastrado.');
  });

  // Checkout
  document.getElementById('checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateRequired(form, ['#checkoutUsuario', '#checkoutPlano'])) {
      showMessage('Selecione usuário e plano para checkout.', 'warning');
      return;
    }
    try {
      svc.checkout(
        Number(document.getElementById('checkoutUsuario').value),
        Number(document.getElementById('checkoutPlano').value),
        document.getElementById('checkoutMetodo').value
      );
      form.reset();
      renderPagamentos();
      showMessage('Checkout concluído e pagamento registrado.');
    } catch (err) {
      showMessage(err.message, 'warning');
    }
  });
}
