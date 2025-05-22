const { pool } = require('../models/db');

// Listar todas as solicitações
exports.getAllRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT s.*, c.nome as categoria_nome, u.nome as beneficiario_nome 
      FROM solicitacoes s
      LEFT JOIN categorias c ON s.categoria_id = c.id
      LEFT JOIN usuarios u ON s.beneficiario_id = u.id
      ORDER BY s.data_solicitacao DESC
    `);
    
    res.status(200).json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ message: 'Erro ao listar solicitações', error: error.message });
  }
};

// Obter solicitação por ID
exports.getRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    const [requests] = await pool.query(`
      SELECT s.*, c.nome as categoria_nome, u.nome as beneficiario_nome, 
             u.telefone, u.email, u.endereco, u.cidade, u.estado, u.cep
      FROM solicitacoes s
      LEFT JOIN categorias c ON s.categoria_id = c.id
      LEFT JOIN usuarios u ON s.beneficiario_id = u.id
      WHERE s.id = ?
    `, [requestId]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Solicitação não encontrada!' });
    }
    
    res.status(200).json(requests[0]);
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    res.status(500).json({ message: 'Erro ao buscar solicitação', error: error.message });
  }
};

// Criar nova solicitação (apenas beneficiários)
exports.createRequest = async (req, res) => {
  try {
    const { descricao, categoria_id, quantidade, urgencia } = req.body;
    const beneficiario_id = req.userId;
    
    // Inserir solicitação
    const [result] = await pool.query(
      'INSERT INTO solicitacoes (beneficiario_id, descricao, categoria_id, quantidade, urgencia) VALUES (?, ?, ?, ?, ?)',
      [beneficiario_id, descricao, categoria_id, quantidade, urgencia]
    );
    
    res.status(201).json({
      message: 'Solicitação cadastrada com sucesso!',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao cadastrar solicitação:', error);
    res.status(500).json({ message: 'Erro ao cadastrar solicitação', error: error.message });
  }
};

// Atualizar solicitação (apenas beneficiário da solicitação ou admin)
exports.updateRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { descricao, categoria_id, quantidade, urgencia } = req.body;
    const userId = req.userId;
    const userType = req.userType;
    
    // Verificar se a solicitação existe e se o usuário é o beneficiário ou admin
    const [requests] = await pool.query('SELECT * FROM solicitacoes WHERE id = ?', [requestId]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Solicitação não encontrada!' });
    }
    
    if (userType !== 'administrador' && requests[0].beneficiario_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para atualizar esta solicitação!' });
    }
    
    // Verificar se a solicitação já foi atendida
    if (requests[0].status === 'atendida' || requests[0].status === 'recusada') {
      return res.status(400).json({ message: 'Não é possível atualizar uma solicitação já atendida ou recusada!' });
    }
    
    // Atualizar solicitação
    await pool.query(
      'UPDATE solicitacoes SET descricao = ?, categoria_id = ?, quantidade = ?, urgencia = ? WHERE id = ?',
      [descricao, categoria_id, quantidade, urgencia, requestId]
    );
    
    res.status(200).json({ message: 'Solicitação atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    res.status(500).json({ message: 'Erro ao atualizar solicitação', error: error.message });
  }
};

// Atualizar status da solicitação (apenas admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, motivo_recusa } = req.body;
    
    // Verificar se a solicitação existe
    const [requests] = await pool.query('SELECT * FROM solicitacoes WHERE id = ?', [requestId]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Solicitação não encontrada!' });
    }
    
    // Atualizar status
    if (status === 'atendida') {
      await pool.query(
        'UPDATE solicitacoes SET status = ?, data_atendimento = NOW() WHERE id = ?',
        [status, requestId]
      );
    } else if (status === 'recusada') {
      await pool.query(
        'UPDATE solicitacoes SET status = ?, motivo_recusa = ? WHERE id = ?',
        [status, motivo_recusa, requestId]
      );
    } else {
      await pool.query(
        'UPDATE solicitacoes SET status = ? WHERE id = ?',
        [status, requestId]
      );
    }
    
    res.status(200).json({ message: 'Status da solicitação atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar status da solicitação:', error);
    res.status(500).json({ message: 'Erro ao atualizar status da solicitação', error: error.message });
  }
};

// Excluir solicitação (apenas beneficiário da solicitação ou admin)
exports.deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.userId;
    const userType = req.userType;
    
    // Verificar se a solicitação existe e se o usuário é o beneficiário ou admin
    const [requests] = await pool.query('SELECT * FROM solicitacoes WHERE id = ?', [requestId]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Solicitação não encontrada!' });
    }
    
    if (userType !== 'administrador' && requests[0].beneficiario_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir esta solicitação!' });
    }
    
    // Verificar se a solicitação já foi atendida
    if (requests[0].status === 'atendida') {
      return res.status(400).json({ message: 'Não é possível excluir uma solicitação já atendida!' });
    }
    
    // Verificar se a solicitação está associada a alguma doação
    const [donations] = await pool.query('SELECT COUNT(*) as count FROM doacoes WHERE solicitacao_id = ?', [requestId]);
    
    if (donations[0].count > 0) {
      return res.status(400).json({ message: 'Não é possível excluir a solicitação pois ela está associada a doações!' });
    }
    
    // Excluir solicitação
    await pool.query('DELETE FROM solicitacoes WHERE id = ?', [requestId]);
    
    res.status(200).json({ message: 'Solicitação excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    res.status(500).json({ message: 'Erro ao excluir solicitação', error: error.message });
  }
};

// Listar solicitações por beneficiário
exports.getRequestsByBeneficiary = async (req, res) => {
  try {
    const beneficiarioId = req.params.beneficiarioId || req.userId;
    
    const [requests] = await pool.query(`
      SELECT s.*, c.nome as categoria_nome
      FROM solicitacoes s
      LEFT JOIN categorias c ON s.categoria_id = c.id
      WHERE s.beneficiario_id = ?
      ORDER BY s.data_solicitacao DESC
    `, [beneficiarioId]);
    
    res.status(200).json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações do beneficiário:', error);
    res.status(500).json({ message: 'Erro ao listar solicitações do beneficiário', error: error.message });
  }
};

// Buscar solicitações
exports.searchRequests = async (req, res) => {
  try {
    const { termo, categoria_id, status, urgencia } = req.query;
    
    let query = `
      SELECT s.*, c.nome as categoria_nome, u.nome as beneficiario_nome
      FROM solicitacoes s
      LEFT JOIN categorias c ON s.categoria_id = c.id
      LEFT JOIN usuarios u ON s.beneficiario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (termo) {
      query += ` AND (s.descricao LIKE ?)`;
      params.push(`%${termo}%`);
    }
    
    if (categoria_id) {
      query += ` AND s.categoria_id = ?`;
      params.push(categoria_id);
    }
    
    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }
    
    if (urgencia) {
      query += ` AND s.urgencia = ?`;
      params.push(urgencia);
    }
    
    query += ` ORDER BY s.data_solicitacao DESC`;
    
    const [requests] = await pool.query(query, params);
    
    res.status(200).json(requests);
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    res.status(500).json({ message: 'Erro ao buscar solicitações', error: error.message });
  }
};
