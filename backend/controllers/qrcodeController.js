const QRCode = require('qrcode');

/**
 * @swagger
 * components:
 *   schemas:
 *     QRCodeResponse:
 *       type: object
 *       properties:
 *         qrcode:
 *           type: string
 *           description: URL da imagem QRCode em formato base64
 *         qrcodeData:
 *           type: object
 *           description: Dados codificados no QRCode para uso direto em aplicativos mobile
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 */

/**
 * Gera um QRCode para o laboratório
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 */
const generateLabQRCode = async (req, res) => {
  try {
    const { labId } = req.params;
    
    if (!labId) {
      return res.status(400).json({ success: false, error: 'ID do laboratório é obrigatório' });
    }
    
    // Dados a serem codificados no QRCode
    const qrcodeData = {
      type: 'lab',
      id: labId,
      timestamp: new Date().toISOString(),
      platform: req.headers['user-agent'] ? (req.headers['user-agent'].includes('Android') ? 'android' : (req.headers['user-agent'].includes('iPhone') || req.headers['user-agent'].includes('iPad') ? 'ios' : 'other')) : 'unknown'
    };
    
    // Gerar QRCode como string base64
    const qrcodeImage = await QRCode.toDataURL(JSON.stringify(qrcodeData), {
      errorCorrectionLevel: 'H', // Alta correção de erros para melhor leitura em dispositivos móveis
      margin: 2, // Margem menor para melhor visualização em telas pequenas
      scale: 8 // Escala maior para melhor leitura
    });
    
    return res.status(200).json({ 
      success: true, 
      qrcode: qrcodeImage,
      qrcodeData: qrcodeData
    });
  } catch (error) {
    console.error('Erro ao gerar QRCode para laboratório:', error);
    return res.status(500).json({ success: false, error: 'Erro ao gerar QRCode' });
  }
};

/**
 * Gera um QRCode para o computador (fluxo aluno)
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 */
const generateComputerQRCode = async (req, res) => {
  try {
    const { computerId } = req.params;
    
    if (!computerId) {
      return res.status(400).json({ success: false, error: 'ID do computador é obrigatório' });
    }
    
    // Dados a serem codificados no QRCode
    const qrcodeData = {
      type: 'computer',
      id: computerId,
      timestamp: new Date().toISOString(),
      platform: req.headers['user-agent'] ? (req.headers['user-agent'].includes('Android') ? 'android' : (req.headers['user-agent'].includes('iPhone') || req.headers['user-agent'].includes('iPad') ? 'ios' : 'other')) : 'unknown'
    };
    
    // Gerar QRCode como string base64
    const qrcodeImage = await QRCode.toDataURL(JSON.stringify(qrcodeData), {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8
    });
    
    return res.status(200).json({ 
      success: true, 
      qrcode: qrcodeImage,
      qrcodeData: qrcodeData
    });
  } catch (error) {
    console.error('Erro ao gerar QRCode para computador:', error);
    return res.status(500).json({ success: false, error: 'Erro ao gerar QRCode' });
  }
};

/**
 * Gera um QRCode para liberação de material (fluxo administrador)
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 */
const generateMaterialReleaseQRCode = async (req, res) => {
  try {
    const { materialId, alunoId } = req.body;
    
    if (!materialId || !alunoId) {
      return res.status(400).json({ success: false, error: 'ID do material e ID do aluno são obrigatórios' });
    }
    
    // Dados a serem codificados no QRCode
    const qrcodeData = {
      type: 'material_release',
      materialId,
      alunoId,
      timestamp: new Date().toISOString(),
      platform: req.headers['user-agent'] ? (req.headers['user-agent'].includes('Android') ? 'android' : (req.headers['user-agent'].includes('iPhone') || req.headers['user-agent'].includes('iPad') ? 'ios' : 'other')) : 'unknown'
    };
    
    // Gerar QRCode como string base64
    const qrcodeImage = await QRCode.toDataURL(JSON.stringify(qrcodeData), {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8
    });
    
    return res.status(200).json({ 
      success: true, 
      qrcode: qrcodeImage,
      qrcodeData: qrcodeData
    });
  } catch (error) {
    console.error('Erro ao gerar QRCode para liberação de material:', error);
    return res.status(500).json({ success: false, error: 'Erro ao gerar QRCode' });
  }
};

/**
 * Verifica e processa um QRCode escaneado
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 */
const processQRCode = async (req, res) => {
  try {
    const { qrcodeData } = req.body;
    
    if (!qrcodeData) {
      return res.status(400).json({ success: false, error: 'Dados do QRCode são obrigatórios' });
    }
    
    // Decodificar os dados do QRCode
    const decodedData = JSON.parse(qrcodeData);
    
    // Adicionar informações da plataforma
    const platform = req.headers['user-agent'] ? 
      (req.headers['user-agent'].includes('Android') ? 'android' : 
       (req.headers['user-agent'].includes('iPhone') || req.headers['user-agent'].includes('iPad') ? 'ios' : 'other')) 
      : 'unknown';
    
    // Processar com base no tipo de QRCode
    switch (decodedData.type) {
      case 'lab':
        // Lógica para processar QRCode de laboratório
        return res.status(200).json({ 
          success: true,
          message: 'QRCode de laboratório processado com sucesso',
          data: decodedData,
          platform
        });
        
      case 'computer':
        // Lógica para processar QRCode de computador
        return res.status(200).json({ 
          success: true,
          message: 'QRCode de computador processado com sucesso',
          data: decodedData,
          platform
        });
        
      case 'material_release':
        // Lógica para processar QRCode de liberação de material
        return res.status(200).json({ 
          success: true,
          message: 'QRCode de liberação de material processado com sucesso',
          data: decodedData,
          platform
        });
      
      case 'notebook_return':
        // Lógica para processar QRCode de devolução de notebook
        
        // Verificar se o laboratório é o mesmo da retirada
        if (decodedData.labId !== req.body.originalLabId) {
          return res.status(400).json({ 
            success: false, 
            error: 'A devolução deve ser realizada no mesmo laboratório da retirada' 
          });
        }
        
        // Verificar se o aluno é o mesmo da retirada
        if (decodedData.alunoId !== req.body.originalAlunoId) {
          return res.status(400).json({ 
            success: false, 
            error: 'A devolução deve ser realizada pelo mesmo aluno que fez a retirada' 
          });
        }
        
        return res.status(200).json({ 
          success: true,
          message: 'QRCode de devolução de notebook processado com sucesso',
          data: decodedData,
          platform
        });
        
      default:
        return res.status(400).json({ success: false, error: 'Tipo de QRCode inválido' });
    }
  } catch (error) {
    console.error('Erro ao processar QRCode:', error);
    return res.status(500).json({ success: false, error: 'Erro ao processar QRCode' });
  }
};

/**
 * Gera um QRCode para devolução de notebook
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 */
const generateNotebookReturnQRCode = async (req, res) => {
  try {
    const { notebookId, alunoId } = req.body;
    
    if (!notebookId || !alunoId) {
      return res.status(400).json({ success: false, error: 'ID do notebook e ID do aluno são obrigatórios' });
    }
    
    // Dados a serem codificados no QRCode
    const qrcodeData = {
      type: 'notebook_return',
      notebookId,
      alunoId,
      timestamp: new Date().toISOString(),
      platform: req.headers['user-agent'] ? (req.headers['user-agent'].includes('Android') ? 'android' : (req.headers['user-agent'].includes('iPhone') || req.headers['user-agent'].includes('iPad') ? 'ios' : 'other')) : 'unknown'
    };
    
    // Gerar QRCode como string base64
    const qrcodeImage = await QRCode.toDataURL(JSON.stringify(qrcodeData), {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8
    });
    
    return res.status(200).json({ 
      success: true, 
      qrcode: qrcodeImage,
      qrcodeData: qrcodeData
    });
  } catch (error) {
    console.error('Erro ao gerar QRCode para devolução de notebook:', error);
    return res.status(500).json({ success: false, error: 'Erro ao gerar QRCode' });
  }
};

module.exports = {
  generateLabQRCode,
  generateComputerQRCode,
  generateMaterialReleaseQRCode,
  generateNotebookReturnQRCode,
  processQRCode
};