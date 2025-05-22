const express = require('express');
const bodyParser = require('body-parser');
const { db } = require('./models/db');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('.')); 

const authRoutes = require('./routes/auth.routes');
const donationRoutes = require('./routes/donation.routes');
const requestRoutes = require('./routes/request.routes');


app.use('/api/auth', authRoutes);
app.use('/api/doacoes', donationRoutes);
app.use('/api/solicitacoes', requestRoutes);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    senha TEXT,
    tipo TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    quantidade INTEGER,
    condicoes TEXT,
    fotos TEXT,
    usuario_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS solicitacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT,
    urgencia TEXT,
    status TEXT DEFAULT 'Pendente',
    usuario_id INTEGER
  )`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}` );
});
