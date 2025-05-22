const { pool } = require('../models/db');

// Listar todas as doações
exports.getAllDonations = async (req, res) => {
  try {
    const [donations] = await pool.query(`
      SELECT d.*, i.nome as item_nome, s.descricao as solicitacao_descricao,
             u1.nome as doador_nome, u2.nome as beneficiario_nome
      FROM doacoes d
      LEFT JOIN itens i ON d.item_id = i.id
      LEFT JOIN solicitacoes s ON d.solicitacao_id = s.id
      LEFT JOIN usuarios u1 ON i.doador_id = u1.id
      LEFT JOIN usuarios u2 ON s.beneficiario_id = u2.id
      ORDER BY d.data_doacao DESC
    `);
    
    res.status(200).json(donations);
  } catch (error) {
    console.error('Erro ao listar doações:', error);
    res.status(500).json({ message: 'Erro ao listar doações', error: error.message });
  }
};

// Obter doação por ID
exports.getDonationById = async (req, res) => {
  try {
    const donationId = req.params.id;
    
    const [donations] = await pool.query(`
      SELECT d.*, i.nome as item_nome, i.descricao as item_descricao, 
             s.descricao as solicitacao_descricao,
             u1.nome as doador_nome, u2.nome as beneficiario_nome,
             u1.telefone as doador_telefone, u2.telefone as beneficiario_telefone,
             u1.email as doador_email, u2.email as beneficiario_email
      FROM doacoes d
      LEFT JOIN itens i ON d.item_id = i.id
      LEFT JOIN solicitacoes s ON d.solicitacao_id = s.id
      LEFT JOIN usuarios u1 ON i.doador_id = u1.id
      LEFT JOIN usuarios u2 ON s.beneficiario_id = u2.id
      WHERE d.id = ?
    `, [donationId]);
    
    if (donations.length === 0) {
      return res.status(404).json({ message: 'Doação não encontrada!' });
    }
    
    res.status(200).json(donations[0]);
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ message: 'Erro ao buscar doação', error: error.message });
  }
};

// Criar nova doação (associar item a uma solicitação)
exports.createDonation = async (req, res) => {
  try {
    const { item_id, solicitacao_id, observacoes } = req.body;
    
    // Verificar se o item existe e está disponível
    const [items] = await pool.query('SELECT * FROM itens WHERE id = ?', [item_id]);
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'Item não encontrado!' });
    }
    
    if (items[0].status !== 'disponivel') {
      return res.status(400).json({ message: 'Item não está disponível para doação!' });
    }
    
    // Verificar se a solicitação existe e está pendente ou aprovada
    const [requests] = await pool.query('SELECT * FROM solicitacoes WHERE id = ?', [solicitacao_id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Solicitação não encontrada!' });
    }
    
    if (requests[0].status !== 'pendente' && requests[0].status !== 'aprovada' && requests[0].status !== 'em_analise') {
      return res.status(400).json({ message: 'Solicitação não está disponível para receber doações!' });
    }
    
    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Inserir doação
      const [result] = await connection.query(
        'INSERT INTO doacoes (item_id, solicitacao_id, observacoes) VALUES (?, ?, ?)',
        [item_id, solicitacao_id, observacoes]
      );
      
      // Atualizar status do item
      await connection.query('UPDATE itens SET status = ? WHERE id = ?', ['reservado', item_id]);
      
      // Atualizar status da solicitação
      await connection.query('UPDATE solicitacoes SET status = ? WHERE id = ?', ['em_analise', solicitacao_id]);
      
      // Commit da transação
      await connection.commit();
      
      res.status(201).json({
        message: 'Doação registrada com sucesso!',
        donationId: result.insertId
      });
    } catch (error) {
      // Rollback em caso de erro
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao registrar doação:', error);
    res.status(500).json({ message: 'Erro ao registrar doação', error: error.message });
  }
};

// Atualizar status da doação
exports.updateDonationStatus = async (req, res) => {
  try {
    const donationId = req.params.id;
    const { status, observacoes } = req.body;
    
    // Verificar se a doação existe
    const [donations] = await pool.query('SELECT * FROM doacoes WHERE id = ?', [donationId]);
    
    if (donations.length === 0) {
      return res.status(404).json({ message: 'Doação não encontrada!' });
    }
    
    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Atualizar status da doação
      if (status === 'entregue') {
        await connection.query(
          'UPDATE doacoes SET status = ?, data_entrega = NOW(), observacoes = ? WHERE id = ?',
          [status, observacoes, donationId]
        );
        
        // Atualizar status do item
        await connection.query('UPDATE itens SET status = ? WHERE id = ?', ['entregue', donations[0].item_id]);
        
        // Atualizar status da solicitação
        await connection.query('UPDATE solicitacoes SET status = ?, data_atendimento = NOW() WHERE id = ?', ['atendida', donations[0].solicitacao_id]);
      } else {
        await connection.query(
          'UPDATE doacoes SET status = ?, observacoes = ? WHERE id = ?',
          [status, observacoes, donationId]
        );
        
        // Se cancelada, voltar item para disponível
        if (status === 'cancelada') {
          await connection.query('UPDATE itens SET status = ? WHERE id = ?', ['disponivel', donations[0].item_id]);
        }
      }
      
      // Commit da transação
      await connection.commit();
      
      res.status(200).json({ message: 'Status da doação atualizado com sucesso!' });
    } catch (error) {
      // Rollback em caso de erro
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar status da doação:', error);
    res.status(500).json({ message: 'Erro ao atualizar status da doação', error: error.message });
  }
};

// Listar doações por doador
exports.getDonationsByDonor = async (req, res) => {
  try {
    const doadorId = req.params.doadorId || req.userId;
    
    const [donations] = await pool.query(`
      SELECT d.*, i.nome as item_nome, s.descricao as solicitacao_descricao,
             u2.nome as beneficiario_nome
      FROM doacoes d
      LEFT JOIN itens i ON d.item_id = i.id
      LEFT JOIN solicitacoes s ON d.solicitacao_id = s.id
      LEFT JOIN usuarios u2 ON s.beneficiario_id = u2.id
      WHERE i.doador_id = ?
      ORDER BY d.data_doacao DESC
    `, [doadorId]);
    
    res.status(200).json(donations);
  } catch (error) {
    console.error('Erro ao listar doações do doador:', error);
    res.status(500).json({ message: 'Erro ao listar doações do doador', error: error.message });
  }
};

// Listar doações por beneficiário
exports.getDonationsByBeneficiary = async (req, res) => {
  try {
    const beneficiarioId = req.params.beneficiarioId || req.userId;
    
    const [donations] = await pool.query(`
      SELECT d.*, i.nome as item_nome, s.descricao as solicitacao_descricao,
             u1.nome as doador_nome
      FROM doacoes d
      LEFT JOIN itens i ON d.item_id = i.id
      LEFT JOIN solicitacoes s ON d.solicitacao_id = s.id
      LEFT JOIN usuarios u1 ON i.doador_id = u1.id
      WHERE s.beneficiario_id = ?
      ORDER BY d.data_doacao DESC
    `, [beneficiarioId]);
    
    res.status(200).json(donations);
  } catch (error) {
    console.error('Erro ao listar doações do beneficiário:', error);
    res.status(500).json({ message: 'Erro ao listar doações do beneficiário', error: error.message });
  }
};
