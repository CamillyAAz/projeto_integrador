const NotificationScheduler = require('../services/notificationScheduler');
const WhatsAppNotificationService = require('../services/whatsappNotificationService');

const notificationScheduler = new NotificationScheduler();
const whatsappService = new WhatsAppNotificationService();

module.exports = {
  async testSimpleMessage(req, res) {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'phoneNumber e message são obrigatórios' });
      }

      const result = await whatsappService.sendMessage(phoneNumber, message, 'Teste Manual');
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async testAutomaticNotifications(req, res) {
    try {
      await notificationScheduler.testNotifications();
      res.json({ success: true, message: 'Teste de notificações executado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async checkDueDates(req, res) {
    try {
      await notificationScheduler.checkDueDates();
      res.json({ success: true, message: 'Verificação de prazos executada' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async checkOverdueLoans(req, res) {
    try {
      await notificationScheduler.checkOverdueLoans();
      res.json({ success: true, message: 'Verificação de empréstimos atrasados executada' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};