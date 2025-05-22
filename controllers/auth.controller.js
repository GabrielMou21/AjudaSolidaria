const { pool } = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar novo usuário
exports.register = async (req, res) => {
  try {
    const { nome, email, senha, telefone, endereco, cidade, estado, cep, tipo_usuario } = req.body;
    
    // Verificar se o email já existe
    const [existingUsers] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado!' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);
    
    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Inserir usuário
      const [result] = await connection.query(
        'INSERT INTO usuarios (nome, email, senha, telefone, endereco, cidade, estado, cep, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, email, hashedPassword, telefone, endereco, cidade, estado, cep, tipo_usuario]
      );
      
      const userId = result.insertId;
      
      // Inserir informações específicas com base no tipo de usuário
      if (tipo_usuario === 'doador') {
        const { cpf_cnpj, tipo_pessoa, descricao } = req.body;
        await connection.query(
          'INSERT INTO doadores (id, cpf_cnpj, tipo_pessoa, descricao) VALUES (?, ?, ?, ?)',
          [userId, cpf_cnpj, tipo_pessoa, descricao]
        );
      } else if (tipo_usuario === 'beneficiario') {
        const { cpf, data_nascimento, renda_familiar, num_dependentes, situacao_moradia } = req.body;
        await connection.query(
          'INSERT INTO beneficiarios (id, cpf, data_nascimento, renda_familiar, num_dependentes, situacao_moradia) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, cpf, data_nascimento, renda_familiar, num_dependentes, situacao_moradia]
        );
      } else if (tipo_usuario === 'organizacao') {
        const { cnpj, nome_responsavel, area_atuacao, descricao, site } = req.body;
        await connection.query(
          'INSERT INTO organizacoes (id, cnpj, nome_responsavel, area_atuacao, descricao, site) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, cnpj, nome_responsavel, area_atuacao, descricao, site]
        );
      }
      
      // Commit da transação
      await connection.commit();
      
      res.status(201).json({
        message: 'Usuário registrado com sucesso!',
        userId: userId
      });
    } catch (error) {
      // Rollback em caso de erro
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Buscar usuário pelo email
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos!' });
    }
    
    const user = users[0];
    
    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou senha incorretos!' });
    }
    
    // Verificar se o usuário está ativo
    if (!user.ativo) {
      return res.status(403).json({ message: 'Conta desativada. Entre em contato com o administrador.' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, tipo: user.tipo_usuario },
      process.env.JWT_SECRET || 'ajuda_solidaria_secret',
      { expiresIn: '24h' }
    );
    
    // Retornar dados do usuário e token
    res.status(200).json({
      message: 'Login realizado com sucesso!',
      token: token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
};

// Obter perfil do usuário
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Buscar dados do usuário
    const [users] = await pool.query('SELECT id, nome, email, telefone, endereco, cidade, estado, cep, tipo_usuario, data_cadastro FROM usuarios WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }
    
    const user = users[0];
    
    // Buscar dados específicos com base no tipo de usuário
    let additionalData = {};
    
    if (user.tipo_usuario === 'doador') {
      const [doadores] = await pool.query('SELECT * FROM doadores WHERE id = ?', [userId]);
      if (doadores.length > 0) {
        additionalData = doadores[0];
      }
    } else if (user.tipo_usuario === 'beneficiario') {
      const [beneficiarios] = await pool.query('SELECT * FROM beneficiarios WHERE id = ?', [userId]);
      if (beneficiarios.length > 0) {
        additionalData = beneficiarios[0];
      }
    } else if (user.tipo_usuario === 'organizacao') {
      const [organizacoes] = await pool.query('SELECT * FROM organizacoes WHERE id = ?', [userId]);
      if (organizacoes.length > 0) {
        additionalData = organizacoes[0];
      }
    }
    
    res.status(200).json({
      user: {
        ...user,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ message: 'Erro ao obter perfil', error: error.message });
  }
};

// Atualizar perfil do usuário
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { nome, telefone, endereco, cidade, estado, cep } = req.body;
    
    // Atualizar dados básicos do usuário
    await pool.query(
      'UPDATE usuarios SET nome = ?, telefone = ?, endereco = ?, cidade = ?, estado = ?, cep = ? WHERE id = ?',
      [nome, telefone, endereco, cidade, estado, cep, userId]
    );
    
    // Atualizar dados específicos com base no tipo de usuário
    const [users] = await pool.query('SELECT tipo_usuario FROM usuarios WHERE id = ?', [userId]);
    
    if (users.length > 0) {
      const userType = users[0].tipo_usuario;
      
      if (userType === 'doador' && req.body.descricao) {
        await pool.query('UPDATE doadores SET descricao = ? WHERE id = ?', [req.body.descricao, userId]);
      } else if (userType === 'beneficiario' && (req.body.renda_familiar || req.body.num_dependentes || req.body.situacao_moradia)) {
        await pool.query(
          'UPDATE beneficiarios SET renda_familiar = ?, num_dependentes = ?, situacao_moradia = ? WHERE id = ?',
          [req.body.renda_familiar, req.body.num_dependentes, req.body.situacao_moradia, userId]
        );
      } else if (userType === 'organizacao' && (req.body.nome_responsavel || req.body.area_atuacao || req.body.descricao || req.body.site)) {
        await pool.query(
          'UPDATE organizacoes SET nome_responsavel = ?, area_atuacao = ?, descricao = ?, site = ? WHERE id = ?',
          [req.body.nome_responsavel, req.body.area_atuacao, req.body.descricao, req.body.site, userId]
        );
      }
    }
    
    res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
  }
};

// Alterar senha
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { senha_atual, nova_senha } = req.body;
    
    // Buscar usuário
    const [users] = await pool.query('SELECT senha FROM usuarios WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }
    
    // Verificar senha atual
    const validPassword = await bcrypt.compare(senha_atual, users[0].senha);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Senha atual incorreta!' });
    }
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nova_senha, salt);
    
    // Atualizar senha
    await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hashedPassword, userId]);
    
    res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha', error: error.message });
  }
};
