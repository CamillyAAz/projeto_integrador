const cron = require('node-cron');
const { Emprestimo, Aluno, Material } = require('../models');
const { Op } = require('sequelize');
const WhatsAppNotificationService = require('./whatsappNotificationService');

class NotificationScheduler {
  constructor() {
    this.whatsappService = new WhatsAppNotificationService();
  }

  start() {
    cron.schedule('0 9 * * *', async () => {
      console.log('Executando verificação de prazos...');
      await this.checkDueDates();
      await this.checkOverdueLoans();
    });

    cron.schedule('0 14 * * *', async () => {
      console.log('Verificando empréstimos atrasados...');
      await this.checkOverdueLoans();
    });

    console.log('Scheduler de notificações iniciado');
  }

  async checkDueDates() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endTomorrow = new Date(tomorrow);
      endTomorrow.setHours(23, 59, 59, 999);

      const emprestimos = await Emprestimo.findAll({
        where: {
          data_devolucao_prevista: {
            [Op.between]: [tomorrow, endTomorrow]
          },
          status: 'ativo',
          aprovado_admin: 1
        },
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Material, as: 'material' }
        ]
      });

      for (const emprestimo of emprestimos) {
        if (emprestimo.aluno && emprestimo.material) {
          try {
            await this.whatsappService.notifyDueSoon(
              emprestimo.aluno, 
              emprestimo.material, 
              emprestimo
            );
            console.log(`Lembrete enviado para ${emprestimo.aluno.nome}`);
          } catch (error) {
            console.error(`Erro ao enviar lembrete para ${emprestimo.aluno.nome}:`, error.message);
          }
        }
      }

      console.log(`${emprestimos.length} lembretes de vencimento enviados`);
    } catch (error) {
      console.error('Erro ao verificar prazos:', error);
    }
  }

  async checkOverdueLoans() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const emprestimos = await Emprestimo.findAll({
        where: {
          data_devolucao_prevista: {
            [Op.lt]: today
          },
          status: 'ativo',
          aprovado_admin: 1
        },
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Material, as: 'material' }
        ]
      });

      for (const emprestimo of emprestimos) {
        await emprestimo.update({ status: 'atrasado' });

        if (emprestimo.aluno && emprestimo.material) {
          try {
            await this.whatsappService.notifyOverdue(
              emprestimo.aluno, 
              emprestimo.material, 
              emprestimo
            );
            console.log(`Alerta de atraso enviado para ${emprestimo.aluno.nome}`);
          } catch (error) {
            console.error(`Erro ao enviar alerta para ${emprestimo.aluno.nome}:`, error.message);
          }
        }
      }

      console.log(`${emprestimos.length} alertas de atraso enviados`);
    } catch (error) {
      console.error('Erro ao verificar empréstimos atrasados:', error);
    }
  }

  async testNotifications() {
    console.log('Testando sistema de notificações...');
    
    try {
      const emprestimo = await Emprestimo.findOne({
        include: [
          { model: Aluno, as: 'aluno' },
          { model: Material, as: 'material' }
        ]
      });

      if (emprestimo && emprestimo.aluno && emprestimo.material) {
        await this.whatsappService.notifyNewLoan(
          emprestimo.aluno, 
          emprestimo.material, 
          emprestimo
        );
        console.log('Notificação de teste enviada com sucesso!');
      } else {
        console.log('Nenhum empréstimo encontrado para teste');
      }
    } catch (error) {
      console.error('Erro no teste de notificação:', error);
    }
  }
}

module.exports = NotificationScheduler;