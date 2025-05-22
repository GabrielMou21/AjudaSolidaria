const { pool } = require('../models/db');

// Listar todas as categorias
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categorias ORDER BY nome');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ message: 'Erro ao listar categorias', error: error.message });
  }
};

// Obter categoria por ID
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const [categories] = await pool.query('SELECT * FROM categorias WHERE id = ?', [categoryId]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada!' });
    }
    
    res.status(200).json(categories[0]);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ message: 'Erro ao buscar categoria', error: error.message });
  }
};

// Criar nova categoria (apenas admin)
exports.createCategory = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    
    // Verificar se a categoria já existe
    const [existingCategories] = await pool.query('SELECT * FROM categorias WHERE nome = ?', [nome]);
    
    if (existingCategories.length > 0) {
      return res.status(400).json({ message: 'Categoria já existe!' });
    }
    
    // Inserir categoria
    const [result] = await pool.query(
      'INSERT INTO categorias (nome, descricao) VALUES (?, ?)',
      [nome, descricao]
    );
    
    res.status(201).json({
      message: 'Categoria criada com sucesso!',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro ao criar categoria', error: error.message });
  }
};

// Atualizar categoria (apenas admin)
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { nome, descricao } = req.body;
    
    // Verificar se a categoria existe
    const [categories] = await pool.query('SELECT * FROM categorias WHERE id = ?', [categoryId]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada!' });
    }
    
    // Atualizar categoria
    await pool.query(
      'UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?',
      [nome, descricao, categoryId]
    );
    
    res.status(200).json({ message: 'Categoria atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro ao atualizar categoria', error: error.message });
  }
};

// Excluir categoria (apenas admin)
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Verificar se a categoria existe
    const [categories] = await pool.query('SELECT * FROM categorias WHERE id = ?', [categoryId]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada!' });
    }
    
    // Verificar se existem itens ou solicitações associados à categoria
    const [items] = await pool.query('SELECT COUNT(*) as count FROM itens WHERE categoria_id = ?', [categoryId]);
    const [requests] = await pool.query('SELECT COUNT(*) as count FROM solicitacoes WHERE categoria_id = ?', [categoryId]);
    
    if (items[0].count > 0 || requests[0].count > 0) {
      return res.status(400).json({ message: 'Não é possível excluir a categoria pois existem itens ou solicitações associados!' });
    }
    
    // Excluir categoria
    await pool.query('DELETE FROM categorias WHERE id = ?', [categoryId]);
    
    res.status(200).json({ message: 'Categoria excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ message: 'Erro ao excluir categoria', error: error.message });
  }
};
