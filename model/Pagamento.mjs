export class Pagamento {
  constructor(id, idAssinatura, valorPago, dataPagamento, metodoPagamento, idTransacaoGateway) {
    this.id = id;
    this.idAssinatura = idAssinatura;
    this.valorPago = valorPago;
    this.dataPagamento = dataPagamento;
    this.metodoPagamento = metodoPagamento;
    this.idTransacaoGateway = idTransacaoGateway;
  }
}
