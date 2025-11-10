const axios = require('axios');

class WhatsAppNotificationService {
  constructor() {
    this.apiUrl = 'https://api.staging.naty.app/api/v2/campaigns/';
    this.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJjcmVhdGU6bWVzc2FnZXMiLCJyZWFkOndoYXRzYXBwcyIsInJlYWQ6Y2FtcGFpZ25zIiwicmVhZDpjaGFubmVscyIsInJlYWQ6dXNlcnMiLCJyZWFkOnF1ZXVlcyIsIm1hbmFnZTpjYW1wYWlnbnMiLCJ1cGRhdGU6d2hhdHNhcHBzIiwiY3JlYXRlOm1lZGlhcyJdLCJjb21wYW55SWQiOiI0MTJiMDIyYS0yMjQ2LTQxN2ItYTJhMy00NjQ4MDJhZDE3NTQiLCJpYXQiOjE3NTEwMzE3Nzh9.hWMrCrgWPDQPTM9JvKkROE6NWRy6zP67-F0qafoUSOA';
    this.whatsappId = '13b0c0a1-c853-40ae-8c02-7a28e65710db';
    this.queueId = '167b95dc-e587-4979-b1a7-450a89c229db';
  }

  async sendMessage(phoneNumber, message, campaignName = 'Notificação Sistema') {
    try {
      const payload = {
        name: campaignName,
        whatsappId: this.whatsappId,
        queueId: this.queueId,
        messages: [
          {
            number: phoneNumber,
            body: message
          }
        ]
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Mensagem WhatsApp enviada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
      throw error;
    }
  }

  async notifyNewLoan(aluno, material, emprestimo) {
    const message = `🏫 *NOVO EMPRÉSTIMO REGISTRADO*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Seu empréstimo foi registrado com sucesso:\n` +
      `📚 Material: ${material.modelo}\n` +
      `📅 Retirada: ${new Date(emprestimo.data_retirada).toLocaleDateString('pt-BR')}\n` +
      `📅 Devolução prevista: ${new Date(emprestimo.data_devolucao_prevista).toLocaleDateString('pt-BR')}\n` +
      `⏰ Período: ${emprestimo.periodo}\n` +
      `📍 Local: ${emprestimo.local_retirada}\n\n` +
      `⚠️ Lembre-se de devolver no prazo!`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Novo Empréstimo'
    );
  }

  async notifyLoanApproval(aluno, material, emprestimo) {
    const message = `✅ *EMPRÉSTIMO APROVADO*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Seu empréstimo foi aprovado pelo administrador:\n` +
      `📚 Material: ${material.modelo}\n` +
      `📅 Devolução prevista: ${new Date(emprestimo.data_devolucao_prevista).toLocaleDateString('pt-BR')}\n` +
      `📍 Retirar em: ${emprestimo.local_retirada}\n\n` +
      `Você já pode retirar o material!`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Empréstimo Aprovado'
    );
  }

  async notifyReturn(aluno, material, emprestimo) {
    const message = `📦 *DEVOLUÇÃO REGISTRADA*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `A devolução foi registrada com sucesso:\n` +
      `📚 Material: ${material.modelo}\n` +
      `📅 Devolvido em: ${new Date().toLocaleDateString('pt-BR')}\n` +
      `📍 Local: ${emprestimo.local_devolucao}\n\n` +
      `✅ Obrigado por devolver no prazo!`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Devolução Registrada'
    );
  }

  async notifyDueSoon(aluno, material, emprestimo) {
    const message = `⏰ *LEMBRETE - PRAZO VENCENDO*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Seu empréstimo vence amanhã:\n` +
      `📚 Material: ${material.modelo}\n` +
      `📅 Vencimento: ${new Date(emprestimo.data_devolucao_prevista).toLocaleDateString('pt-BR')}\n` +
      `📍 Devolver em: ${emprestimo.local_devolucao}\n\n` +
      `⚠️ Não se esqueça de devolver!`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Lembrete Vencimento'
    );
  }

  async notifyOverdue(aluno, material, emprestimo) {
    const diasAtraso = Math.ceil((new Date() - new Date(emprestimo.data_devolucao_prevista)) / (1000 * 60 * 60 * 24));
    
    const message = `🚨 *EMPRÉSTIMO EM ATRASO*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Seu empréstimo está em atraso:\n` +
      `📚 Material: ${material.modelo}\n` +
      `📅 Deveria ter sido devolvido: ${new Date(emprestimo.data_devolucao_prevista).toLocaleDateString('pt-BR')}\n` +
      `📊 Dias de atraso: ${diasAtraso}\n` +
      `📍 Devolver em: ${emprestimo.local_devolucao}\n\n` +
      `🔴 Por favor, regularize a situação o quanto antes!`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Empréstimo Atrasado'
    );
  }

  formatPhoneNumber(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone.startsWith('55')) {
      return '55' + cleanPhone;
    }
    
    return cleanPhone;
  }

  async notifyFine(aluno, material, valorMulta, emprestimo) {
    const message = `💰 *MULTA APLICADA*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Uma multa foi aplicada ao seu empréstimo:\n` +
      `📚 Material: ${material.nome}\n` +
      `💵 Valor da multa: R$ ${valorMulta.toFixed(2)}\n` +
      `📅 Data prevista: ${new Date(emprestimo.data_devolucao_prevista).toLocaleDateString('pt-BR')}\n\n` +
      `⚠️ Por favor, regularize seu pagamento na secretaria.`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Multa Aplicada'
    );
  }

  async notifySuspension(aluno, valorPendente, motivo = 'multas_pendentes', descricao = '') {
    const motivoTexto = {
      'multas_pendentes': 'acúmulo de multas pendentes',
      'danos_nao_pagos': 'danos não pagos',
      'atraso_recorrente': 'atrasos recorrentes',
      'outros': 'outras razões'
    };

    const message = `🚫 *SUSPENSÃO DE CONTA*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Sua conta foi suspensa por: ${motivoTexto[motivo] || motivo}\n` +
      `💵 Valor pendente: R$ ${parseFloat(valorPendente).toFixed(2)}\n` +
      `${descricao ? `\nMotivo: ${descricao}\n` : ''}` +
      `\n⚠️ Você não poderá realizar novos empréstimos até regularizar sua situação.\n\n` +
      `Procure a secretaria para mais informações.`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Conta Suspensa'
    );
  }

  async notifySuspensionLifted(aluno) {
    const message = `✅ *SUSPENSÃO REMOVIDA*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Sua suspensão foi removida!\n\n` +
      `Você já pode realizar novos empréstimos.\n\n` +
      `Obrigado por regularizar sua situação! 🎉`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Suspensão Removida'
    );
  }

  async notifyDamage(aluno, material, dano) {
    const gravidadeTexto = {
      'leve': 'Leve',
      'moderado': 'Moderado',
      'grave': 'Grave',
      'perda_total': 'Perda Total'
    };

    const message = `⚠️ *REGISTRO DE DANO*\n\n` +
      `Olá ${aluno.nome}!\n\n` +
      `Foi registrado um dano no material emprestado:\n` +
      `📚 Material: ${material.nome}\n` +
      `🔧 Gravidade: ${gravidadeTexto[dano.gravidade]}\n` +
      `📝 Descrição: ${dano.descricao_dano}\n` +
      `💵 Valor do reparo: R$ ${parseFloat(dano.valor_reparo).toFixed(2)}\n\n` +
      `Por favor, procure a secretaria para regularizar a situação.`;

    return await this.sendMessage(
      this.formatPhoneNumber(aluno.telefone || '5545999999999'),
      message,
      'Dano Registrado'
    );
  }
}

module.exports = WhatsAppNotificationService;