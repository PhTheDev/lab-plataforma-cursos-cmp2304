import { db, counters, nowIso, byId } from './DbService.mjs';
import { Plano } from '../model/Plano.mjs';
import { Assinatura } from '../model/Assinatura.mjs';
import { Pagamento } from '../model/Pagamento.mjs';

export class FinanceiroService {
  // ── Planos ───────────────────────────────────────────────────────────────────
  salvarPlano(nome, descricao, preco, duracaoMeses) {
    const plano = new Plano(counters.plano++, nome, descricao, preco, duracaoMeses);
    db.planos.push(plano);
    return plano;
  }

  // ── Checkout: cria Assinatura + Pagamento ────────────────────────────────────
  checkout(idUsuario, idPlano, metodoPagamento) {
    const plano = byId(db.planos, idPlano);
    if (!plano) throw new Error('Plano inválido.');

    const inicio = new Date();
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + plano.duracaoMeses);

    const assinatura = new Assinatura(
      counters.assinatura++, idUsuario, idPlano,
      inicio.toISOString(), fim.toISOString()
    );
    db.assinaturas.push(assinatura);

    const pagamento = new Pagamento(
      counters.pagamento++,
      assinatura.id,
      plano.preco,
      nowIso(),
      metodoPagamento,
      `TXN-${Date.now().toString(36).toUpperCase()}`
    );
    db.pagamentos.push(pagamento);

    return { assinatura, pagamento };
  }
}
