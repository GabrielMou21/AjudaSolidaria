const { pool } = require('../models/db');

// Listar todos os itens disponíveis
exports.getAllItems = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT i.*, c.nome as categoria_nome, u.nome as doador_nome 
      FROM itens i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN usuarios u ON i.doador_id = u.id
      ORDER BY i.data_cadastro DESC
    `);
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ message: 'Erro ao listar itens', error: error.message });
  }
};

// Obter item por ID
exports.getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const [items] = await pool.query(`
      SELECT i.*, c.nome as categoria_nome, u.nome as doador_nome 
      FROM itens i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN usuarios u ON i.doador_id = u.id
      WHERE i.id = ?
    `, [itemId]);
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'Item não encontrado!' });
    }
    
    res.status(200).json(items[0]);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ message: 'Erro ao buscar item', error: error.message });
  }
};

// Criar novo item (apenas doadores)
exports.createItem = async (req, res) => {
  try {
    const { nome, descricao, quantidade, categoria_id, estado_conservacao, imagem_url } = req.body;
    const doador_id = req.userId;
    
    // Inserir item
    const [result] = await pool.query(
      'INSERT INTO itens (nome, descricao, quantidade, categoria_id, estado_conservacao, imagem_url, doador_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, descricao, quantidade, categoria_id, estado_conservacao, imagem_url, doador_id]
    );
    
    res.status(201).json({
      message: 'Item cadastrado com sucesso!',
      itemId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao cadastrar item:', error);
    res.status(500).json({ message: 'Erro ao cadastrar item', error: error.message });
  }
};

// Atualizar item (apenas doador do item ou admin)
exports.updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { nome, descricao, quantidade, categoria_id, estado_conservacao, imagem_url, status } = req.body;
    const userId = req.userId;
    const userType = req.userType;
    
    // Verificar se o item existe e se o usuário é o doador ou admin
    const [items] = await pool.query('SELECT * FROM itens WHERE id = ?', [itemId]);
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'Item não encontrado!' });
    }
    
    if (userType !== 'administrador' && items[0].doador_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para atualizar este item!' });
    }
    
    // Atualizar item
    await pool.query(
      'UPDATE itens SET nome = ?, descricao = ?, quantidade = ?, categoria_id = ?, estado_conservacao = ?, imagem_url = ?, status = ? WHERE id = ?',
      [nome, descricao, quantidade, categoria_id, estado_conservacao, imagem_url, status, itemId]
    );
    
    res.status(200).json({ message: 'Item atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ message: 'Erro ao atualizar item', error: error.message });
  }
};

// Excluir item (apenas doador do item ou admin)
exports.deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.userId;
    const userType = req.userType;
    
    // Verificar se o item existe e se o usuário é o doador ou admin
    const [items] = await pool.query('SELECT * FROM itens WHERE id = ?', [itemId]);
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'Item não encontrado!' });
    }
    
    if (userType !== 'administrador' && items[0].doador_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este item!' });
    }
    
    // Verificar se o item está associado a alguma doação
    const [donations] = await pool.query('SELECT COUNT(*) as count FROM doacoes WHERE item_id = ?', [itemId]);
    
    if (donations[0].count > 0) {
      return res.status(400).json({ message: 'Não é possível excluir o item pois ele está associado a doações!' });
    }
    
    // Excluir item
    await pool.query('DELETE FROM itens WHERE id = ?', [itemId]);
    
    res.status(200).json({ message: 'Item excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    res.status(500).json({ message: 'Erro ao excluir item', error: error.message });
  }
};

// Listar itens por doador
exports.getItemsByDonor = async (req, res) => {
  try {
    const doadorId = req.params.doadorId || req.userId;
    
    const [items] = await pool.query(`
      SELECT i.*, c.nome as categoria_nome
      FROM itens i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      WHERE i.doador_id = ?
      ORDER BY i.data_cadastro DESC
    `, [doadorId]);
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Erro ao listar itens do doador:', error);
    res.status(500).json({ message: 'Erro ao listar itens do doador', error: error.message });
  }
};

// Listar itens por categoria
exports.getItemsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    const [items] = await pool.query(`
      SELECT i.*, c.nome as categoria_nome, u.nome as doador_nome
      FROM itens i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN usuarios u ON i.doador_id = u.id
      WHERE i.categoria_id = ? AND i.status = 'disponivel'
      ORDER BY i.data_cadastro DESC
    `, [categoryId]);
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Erro ao listar itens por categoria:', error);
    res.status(500).json({ message: 'Erro ao listar itens por categoria', error: error.message });
  }
};

// Buscar itens
exports.searchItems = async (req, res) => {
  try {
    const { termo, categoria_id, status } = req.query;
    
    let query = `
      SELECT i.*, c.nome as categoria_nome, u.nome as doador_nome
      FROM itens i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN usuarios u ON i.doador_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (termo) {
      query += ` AND (i.nome LIKE ? OR i.descricao LIKE ?)`;
      params.push(`%${termo}%`, `%${termo}%`);
    }
    
    if (categoria_id) {
      query += ` AND i.categoria_id = ?`;
      params.push(categoria_id);
    }
    
    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY i.data_cadastro DESC`;
    
    const [items] = await pool.query(query, params);
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    res.status(500).json({ message: 'Erro ao buscar itens', error: error.message });
  }
};
