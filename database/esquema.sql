-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS ajuda_solidaria;
USE ajuda_solidaria;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    tipo_usuario ENUM('doador', 'beneficiario', 'organizacao', 'administrador') NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Doadores (estende usuários)
CREATE TABLE doadores (
    id INT PRIMARY KEY,
    cpf_cnpj VARCHAR(20) UNIQUE,
    tipo_pessoa ENUM('fisica', 'juridica') NOT NULL,
    descricao TEXT,
    FOREIGN KEY (id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Beneficiários (estende usuários)
CREATE TABLE beneficiarios (
    id INT PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    renda_familiar DECIMAL(10,2),
    num_dependentes INT,
    situacao_moradia VARCHAR(50),
    FOREIGN KEY (id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Categorias de Itens
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT
);

-- Tabela de Itens para Doação
CREATE TABLE itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    quantidade INT NOT NULL,
    categoria_id INT,
    estado_conservacao VARCHAR(50),
    imagem_url VARCHAR(255),
    doador_id INT,
    status ENUM('disponivel', 'reservado', 'entregue') DEFAULT 'disponivel',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (doador_id) REFERENCES doadores(id)
);

-- Tabela de Solicitações
CREATE TABLE solicitacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    beneficiario_id INT,
    descricao TEXT NOT NULL,
    categoria_id INT,
    quantidade INT,
    urgencia ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    status ENUM('pendente', 'em_analise', 'aprovada', 'atendida', 'recusada') DEFAULT 'pendente',
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atendimento TIMESTAMP NULL,
    motivo_recusa TEXT,
    FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de Doações (relacionamento entre itens e solicitações)
CREATE TABLE doacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    solicitacao_id INT,
    data_doacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('agendada', 'em_transito', 'entregue', 'cancelada') DEFAULT 'agendada',
    data_entrega TIMESTAMP NULL,
    observacoes TEXT,
    FOREIGN KEY (item_id) REFERENCES itens(id),
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id)
);


-- Tabela de Mensagens
CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    assunto VARCHAR(100),
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
);


-- Inserir categorias iniciais
INSERT INTO categorias (nome, descricao) VALUES 
('Alimentos', 'Alimentos não perecíveis, cestas básicas'),
('Roupas', 'Vestuário em geral, calçados, agasalhos'),
('Móveis', 'Móveis e utensílios domésticos'),
('Material Escolar', 'Cadernos, lápis, mochilas e outros materiais escolares'),
('Brinquedos', 'Brinquedos e jogos para crianças'),
('Medicamentos', 'Remédios e produtos de saúde'),
('Higiene Pessoal', 'Produtos de higiene e limpeza');

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
VALUES ('Administrador', 'admin@ajudasolidaria.org', '$2b$10$X7ROS9c8h5ORw.nFAOQZm.HKbQJMFO3vcGbYzGYbfgEJYFPxjQMuO', 'administrador');
-- Senha: admin123 (hash bcrypt)
