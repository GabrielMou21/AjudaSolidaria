const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../models/db');

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido!' });
  }
  
  const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  try {
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET || 'ajuda_solidaria_secret');
    req.userId = decoded.id;
    req.userType = decoded.tipo;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido!' });
  }
};

// Middleware para verificar permissões de administrador
const isAdmin = (req, res, next) => {
  if (req.userType !== 'administrador') {
    return res.status(403).json({ message: 'Requer permissão de administrador!' });
  }
  next();
};

// Middleware para verificar permissões de doador
const isDoador = (req, res, next) => {
  if (req.userType !== 'doador' && req.userType !== 'administrador') {
    return res.status(403).json({ message: 'Requer permissão de doador!' });
  }
  next();
};

// Middleware para verificar permissões de beneficiário
const isBeneficiario = (req, res, next) => {
  if (req.userType !== 'beneficiario' && req.userType !== 'administrador') {
    return res.status(403).json({ message: 'Requer permissão de beneficiário!' });
  }
  next();
};

// Middleware para verificar permissões de organização
const isOrganizacao = (req, res, next) => {
  if (req.userType !== 'organizacao' && req.userType !== 'administrador') {
    return res.status(403).json({ message: 'Requer permissão de organização!' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isDoador,
  isBeneficiario,
  isOrganizacao
};
