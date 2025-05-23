const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./banco.db');

// Criar tabelas no banco
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT, email TEXT, telefone TEXT,
    endereco TEXT, senha TEXT, tipo TEXT,
    tentativas INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT, quantidade INTEGER, condicoes TEXT,
    fotos TEXT, usuario_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS solicitacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT, urgencia TEXT,
    status TEXT DEFAULT 'Pendente', usuario_id INTEGER
  )`);
});

// CRUD usuários
app.post('/usuarios', (req, res) => {
  const { nome, email, telefone, endereco, senha, tipo } = req.body;
  db.run('INSERT INTO usuarios (nome, email, telefone, endereco, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, email, telefone, endereco, senha, tipo],
    function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      enviarEmail(email, 'Cadastro atualizado com sucesso', 'Seus dados foram registrados.');
      res.status(201).json({ id: this.lastID });
    });
});

app.get('/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.put('/usuarios/:id', (req, res) => {
  const { nome, email, telefone, endereco, senha, tipo } = req.body;
  db.run(`UPDATE usuarios SET nome=?, email=?, telefone=?, endereco=?, senha=?, tipo=? WHERE id=?`,
    [nome, email, telefone, endereco, senha, tipo, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      enviarEmail(email, 'Dados atualizados', 'Seus dados foram alterados com sucesso.');
      res.json({ mensagem: 'Usuário atualizado' });
    });
});

app.delete('/usuarios/:id', (req, res) => {
  db.run('DELETE FROM usuarios WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Usuário excluído' });
  });
});

// Login com bloqueio de 3 tentativas
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(400).json({ erro: 'Usuário não encontrado' });
    if (user.tentativas >= 3) return res.status(403).json({ erro: 'Conta bloqueada por tentativas inválidas' });
    if (user.senha === senha) {
      db.run('UPDATE usuarios SET tentativas = 0 WHERE id = ?', [user.id]);
      res.json({ mensagem: 'Login bem-sucedido' });
    } else {
      db.run('UPDATE usuarios SET tentativas = tentativas + 1 WHERE id = ?', [user.id]);
      res.status(401).json({ erro: 'Senha incorreta' });
    }
  });
});

// CRUD doações
app.post('/doacoes', (req, res) => {
  const { tipo, quantidade, condicoes, fotos, usuario_id } = req.body;
  db.run('INSERT INTO doacoes (tipo, quantidade, condicoes, fotos, usuario_id) VALUES (?, ?, ?, ?, ?)',
    [tipo, quantidade, condicoes, fotos, usuario_id],
    function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.get('/doacoes', (req, res) => {
  db.all('SELECT * FROM doacoes', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.delete('/doacoes/:id', (req, res) => {
  db.run('DELETE FROM doacoes WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Doação excluída' });
  });
});

// CRUD solicitações
app.post('/solicitacoes', (req, res) => {
  const { descricao, urgencia, usuario_id } = req.body;
  db.run('INSERT INTO solicitacoes (descricao, urgencia, usuario_id) VALUES (?, ?, ?)',
    [descricao, urgencia, usuario_id],
    function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.get('/solicitacoes', (req, res) => {
  db.all('SELECT * FROM solicitacoes', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.put('/solicitacoes/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE solicitacoes SET status = ? WHERE id = ?', [status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ mensagem: 'Status atualizado' });
    });
});

app.delete('/solicitacoes/:id', (req, res) => {
  db.run('DELETE FROM solicitacoes WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Solicitação excluída' });
  });
});

// Simulação de envio de e-mail (printa no terminal)
function enviarEmail(destinatario, assunto, corpo) {
  console.log(`📧 E-mail enviado para ${destinatario} | Assunto: ${assunto} | Mensagem: ${corpo}`);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
