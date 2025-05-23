# PROJETO AJUDA SOLIDÁRIA. 
O projeto foi criado com o objetivo de ajudar pessoas necessitadas de forma mais prática e rápida. 

![Logotipo](https://github.com/user-attachments/assets/e9fe668f-2725-4388-93f8-fbc527fc5a51)

## Descrição do Projeto

O AjudaSolidária é uma plataforma digital que facilita a doação e distribuição de recursos para comunidades carentes. O sistema permite o cadastro de três tipos de usuários:

- **Doadores**: Indivíduos ou empresas que desejam doar recursos (alimentos, roupas, brinquedos, etc.)
- **Beneficiários**: Pessoas em situação de vulnerabilidade que precisam de recursos ou apoio
- 
# Nosso objetivo
Nosso objetivo é fazer com que a ajuda chegue para todas pessoas de forma rápida e eficaz. Pensando nisso, criamos o site para que essas pessoas possam solicitar tudo aquilo que precisam, tanto por uma págona na web ou aplicativo

# Como funciona?
Nosso site é simples e intuitivo, basta seguir essas indicações:

*VOLUNTÁRIO*: clique na opção (**Quero ajudar**), preencha seus dados, escolha uma solicitação mais próxima e ajude a pessoa que está precisando.

*QUEM PRECISA DE AJUDA:* clicar em uma opção (**Preciso de Ajuda**), preencher seus dados e solicitar.

## Funcionalidades

### Gerais
- **Tema Claro/Escuro**: Sistema de alternância entre temas para melhor experiência do usuário
- **Design Responsivo**: Interface adaptável a diferentes dispositivos (desktop, tablet, mobile)
- **Acessibilidade**: Elementos de interface projetados para serem acessíveis a todos os usuários

### Páginas e Recursos
- **Página Home**: Apresentação da ONG, missão, valores e botões de acesso rápido
- **Página de Doações**: Cadastro e listagem de itens disponíveis com filtros por categoria e status
- **Página de Solicitação**: Formulário para beneficiários solicitarem ajuda com dados pessoais e necessidades
- **Login/Cadastro**: Sistema de autenticação para três tipos de usuários (doador, beneficiário, administrador)
- **Painel do Administrador**: 
  - Visualização e gerenciamento de solicitações
  - Aprovação ou recusa de pedidos de ajuda
  - Gerenciamento de usuários
  - Relatórios e estatísticas
- **Área do Beneficiário**: Acompanhamento do andamento da solicitação e histórico
- **Página de Confirmação**: Feedback após envio de formulários ou conclusão de ações

### Estrutura de pastas

```
ajuda-solidaria/
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   ├── alimentos.jpg
│   │   ├── roupas.jpg
│   │   ├── moveis.jpg
│   │   └── material-escolar.jpg
│   └── icons/
├── css/
│   └── styles.css
├── js/
│   ├── theme.js
│   ├── auth.js
│   └── api.js
├── pages/
│   ├── home.html
│   ├── cadastro.html
│   ├── login.html
│   ├── doacoes.html
│   ├── solicitar.html
│   ├── dashboard.html
│   └── resposta.html
├── models/
│   └── db.js
├── controllers/
│   ├── auth.controller.js
│   ├── donation.controller.js
│   ├── request.controller.js
│   ├── category.controller.js
│   ├── item.controller.js
│   └── event.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── donation.routes.js
│   ├── request.routes.js
│   ├── category.routes.js
│   ├── item.routes.js
│   └── event.routes.js
├── middleware/
│   └── auth.middleware.js
├── database/
│   └── esquema.sql
├── node_modules/
├── .env
├── .gitignore
├── banco.db
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── server.js
```
- 
# site
