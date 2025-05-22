# Requisitos Funcionais e Não Funcionais

## Visão Geral

Este documento apresenta os requisitos funcionais e não funcionais da plataforma AjudaSolidária, um sistema digital voltado à doação e distribuição de recursos para comunidades carentes. A plataforma conecta doadores, beneficiários e organizações sociais, facilitando o processo de doação e solicitação de recursos.

## Requisitos Funcionais

### RF001 - Cadastro de usuários
O sistema deve permitir o cadastro de doadores, beneficiários e organizações sociais.
Para cada usuário, o sistema deve coletar: nome completo, e-mail válido, telefone e endereço.

### RF002 - Autenticação
O sistema deve permitir login com e-mail e senha.
O sistema deve implementar bloqueio após 3 tentativas falhas de login.

### RF003 - Cadastro de doações
O sistema deve permitir que doadores cadastrem itens para doação.
Para cada item, o sistema deve coletar: tipo, quantidade, condições e fotos.

### RF004 - Solicitações de Exclusão de registros
O sistema deve permitir que beneficiários cadastrem solicitações.
Para cada solicitação, o sistema deve coletar: descrição detalhada e nível de urgência.

### RF005 - Edição de cadastros
O sistema deve permitir a atualização de dados de usuários.
O sistema deve enviar confirmação por e-mail após atualização de dados.

### RF006 - Atualização de status
O sistema deve permitir mudança de status das solicitações.
A transição de status deve seguir o fluxo: Pendente → Atendida.

### RF007 - Acompanhamento
O sistema deve permitir que beneficiários visualizem o status atual de suas solicitações.

### RF008 - Exclusão de registro
O sistema deve permitir remoção de solicitações duplicadas.
O sistema deve permitir remoção de solicitações já atendidas.

### RF009 - Notificações
O sistema deve enviar alertas sobre mudanças de status para doadores.
O sistema deve enviar alertas sobre mudanças de status para beneficiários.

### RF010 - Administração
O sistema deve permitir que moderadores gerenciem usuários.
O sistema deve permitir que moderadores gerenciem conteúdo.

### RF011 - Confirmações
O sistema deve enviar e-mails de confirmação para ações importantes.

### RF012 - Recuperação de senha
O sistema deve permitir reset de senha via link temporário por e-mail.

## Requisitos Não Funcionais (RNF)

### RNF01 - Desempenho
O sistema deve funcionar mesmo com conexões lentas.
O sistema deve otimizar o carregamento de imagens.

### RNF02 - Usabilidade
O sistema deve funcionar em dispositivos móveis.
O sistema deve funcionar em computadores.

### RNF03 - Estabilidade
O sistema deve suportar 100 usuários simultâneos.

### RNF04 - Validação
O sistema deve verificar em tempo real todos os campos essenciais.

### RNF05 - Relatórios
O sistema deve permitir exportação mensal de relatórios em formato PDF.

### RNF06 - Segurança
O sistema deve garantir segurança básica no login.
O sistema deve garantir segurança básica nos dados dos usuários.

### RNF07 - Acessibilidade
O sistema deve seguir boas práticas de acessibilidade, incluindo contraste de cores.
O sistema deve implementar o uso de ARIA para melhor acessibilidade.
