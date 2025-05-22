const { pool } = require('../models/db');

// Listar todos os eventos
exports.getAllEvents = async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, o.nome_responsavel, u.nome as organizacao_nome
      FROM eventos e
      LEFT JOIN organizacoes o ON e.organizacao_id = o.id
      LEFT JOIN usuarios u ON o.id = u.id
      ORDER BY e.data_inicio DESC
    `);
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ message: 'Erro ao listar eventos', error: error.message });
  }
};

// Obter evento por ID
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const [events] = await pool.query(`
      SELECT e.*, o.nome_responsavel, u.nome as organizacao_nome, 
             u.telefone, u.email, u.endereco, u.cidade, u.estado
      FROM eventos e
      LEFT JOIN organizacoes o ON e.organizacao_id = o.id
      LEFT JOIN usuarios u ON o.id = u.id
      WHERE e.id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado!' });
    }
    
    res.status(200).json(events[0]);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ message: 'Erro ao buscar evento', error: error.message });
  }
};

// Criar novo evento (apenas organizações)
exports.createEvent = async (req, res) => {
  try {
    const { titulo, descricao, data_inicio, data_fim, local, imagem_url } = req.body;
    const organizacao_id = req.userId;
    
    // Verificar se o usuário é uma organização
    const [orgs] = await pool.query('SELECT * FROM organizacoes WHERE id = ?', [organizacao_id]);
    
    if (orgs.length === 0) {
      return res.status(403).json({ message: 'Apenas organizações podem criar eventos!' });
    }
    
    // Inserir evento
    const [result] = await pool.query(
      'INSERT INTO eventos (organizacao_id, titulo, descricao, data_inicio, data_fim, local, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [organizacao_id, titulo, descricao, data_inicio, data_fim, local, imagem_url]
    );
    
    res.status(201).json({
      message: 'Evento criado com sucesso!',
      eventId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
  }
};

// Atualizar evento (apenas organização do evento ou admin)
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { titulo, descricao, data_inicio, data_fim, local, imagem_url, status } = req.body;
    const userId = req.userId;
    const userType = req.userType;
    
    // Verificar se o evento existe e se o usuário é a organização ou admin
    const [events] = await pool.query('SELECT * FROM eventos WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado!' });
    }
    
    if (userType !== 'administrador' && events[0].organizacao_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para atualizar este evento!' });
    }
    
    // Atualizar evento
    await pool.query(
      'UPDATE eventos SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ?, imagem_url = ?, status = ? WHERE id = ?',
      [titulo, descricao, data_inicio, data_fim, local, imagem_url, status, eventId]
    );
    
    res.status(200).json({ message: 'Evento atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
  }
};

// Excluir evento (apenas organização do evento ou admin)
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId;
    const userType = req.userType;
    
    // Verificar se o evento existe e se o usuário é a organização ou admin
    const [events] = await pool.query('SELECT * FROM eventos WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado!' });
    }
    
    if (userType !== 'administrador' && events[0].organizacao_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este evento!' });
    }
    
    // Excluir evento
    await pool.query('DELETE FROM eventos WHERE id = ?', [eventId]);
    
    res.status(200).json({ message: 'Evento excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    res.status(500).json({ message: 'Erro ao excluir evento', error: error.message });
  }
};

// Listar eventos por organização
exports.getEventsByOrganization = async (req, res) => {
  try {
    const organizacaoId = req.params.organizacaoId || req.userId;
    
    const [events] = await pool.query(`
      SELECT e.*
      FROM eventos e
      WHERE e.organizacao_id = ?
      ORDER BY e.data_inicio DESC
    `, [organizacaoId]);
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos da organização:', error);
    res.status(500).json({ message: 'Erro ao listar eventos da organização', error: error.message });
  }
};

// Listar eventos ativos
exports.getActiveEvents = async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, o.nome_responsavel, u.nome as organizacao_nome
      FROM eventos e
      LEFT JOIN organizacoes o ON e.organizacao_id = o.id
      LEFT JOIN usuarios u ON o.id = u.id
      WHERE e.status = 'agendado' OR e.status = 'em_andamento'
      AND e.data_fim >= NOW()
      ORDER BY e.data_inicio ASC
    `);
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos ativos:', error);
    res.status(500).json({ message: 'Erro ao listar eventos ativos', error: error.message });
  }
};
