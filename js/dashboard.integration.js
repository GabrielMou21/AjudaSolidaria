// Arquivo de integração para dashboard.html

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType");
    const userName = localStorage.getItem("userName");
    
    if (!isLoggedIn) {
        // Redirecionar para login se não estiver logado
        window.location.href = 'login.html';
        return;
    }
    
    // Atualizar nome do usuário
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = userName || "Usuário";
    }
    
    // Personalizar sidebar com base no tipo de usuário
    if (userType === "doador") {
        // Mostrar apenas itens relevantes para doadores
        document.querySelector(".user-avatar img").src = "../assets/avatar-doador.jpg";
        
        // Ocultar itens de menu não relevantes para doadores
        const adminItems = document.querySelectorAll('.admin-only');
        adminItems.forEach(item => item.style.display = 'none');
        
        const beneficiaryItems = document.querySelectorAll('.beneficiary-only');
        beneficiaryItems.forEach(item => item.style.display = 'none');
    } else if (userType === "beneficiario") {
        // Mostrar apenas itens relevantes para beneficiários
        document.querySelector(".user-avatar img").src = "../assets/avatar-beneficiario.jpg";
        
        // Ocultar itens de menu não relevantes para beneficiários
        const adminItems = document.querySelectorAll('.admin-only');
        adminItems.forEach(item => item.style.display = 'none');
        
        const donorItems = document.querySelectorAll('.donor-only');
        donorItems.forEach(item => item.style.display = 'none');
    } else if (userType === "organizacao") {
        // Mostrar apenas itens relevantes para organizações
        document.querySelector(".user-avatar img").src = "../assets/avatar-organizacao.jpg";
        
        // Ocultar itens de menu não relevantes para organizações
        const adminItems = document.querySelectorAll('.admin-only');
        adminItems.forEach(item => item.style.display = 'none');
    }
    
    // Carregar estatísticas do dashboard
    try {
        const estatisticas = await window.dashboardService.obterEstatisticas();
        
        // Atualizar cards de estatísticas
        const cards = document.querySelectorAll('.dashboard-card-value');
        if (cards.length >= 4) {
            cards[0].textContent = estatisticas.total_doacoes || '0';
            cards[1].textContent = estatisticas.solicitacoes_pendentes || '0';
            cards[2].textContent = estatisticas.doacoes_entregues || '0';
            cards[3].textContent = estatisticas.total_usuarios || '0';
        }
        
        // Atualizar indicadores de variação
        const changes = document.querySelectorAll('.dashboard-card-change');
        if (changes.length >= 4) {
            atualizarIndicadorVariacao(changes[0], estatisticas.variacao_doacoes);
            atualizarIndicadorVariacao(changes[1], estatisticas.variacao_solicitacoes, true);
            atualizarIndicadorVariacao(changes[2], estatisticas.variacao_entregas);
            atualizarIndicadorVariacao(changes[3], estatisticas.variacao_usuarios);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
    
    // Carregar solicitações recentes
    try {
        const solicitacoes = await window.dashboardService.obterSolicitacoesRecentes();
        
        // Atualizar tabela de solicitações
        const solicitacoesTable = document.querySelector('.dashboard-section:nth-child(1) tbody');
        if (solicitacoesTable) {
            solicitacoesTable.innerHTML = '';
            
            if (solicitacoes.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="7" class="text-center">Nenhuma solicitação encontrada</td>';
                solicitacoesTable.appendChild(tr);
            } else {
                solicitacoes.forEach(solicitacao => {
                    const tr = criarLinhaSolicitacao(solicitacao);
                    solicitacoesTable.appendChild(tr);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar solicitações recentes:', error);
    }
    
    // Carregar doações recentes
    try {
        const doacoes = await window.dashboardService.obterDoacoesRecentes();
        
        // Atualizar tabela de doações
        const doacoesTable = document.querySelector('.dashboard-section:nth-child(2) tbody');
        if (doacoesTable) {
            doacoesTable.innerHTML = '';
            
            if (doacoes.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="7" class="text-center">Nenhuma doação encontrada</td>';
                doacoesTable.appendChild(tr);
            } else {
                doacoes.forEach(doacao => {
                    const tr = criarLinhaDoacao(doacao);
                    doacoesTable.appendChild(tr);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar doações recentes:', error);
    }
    
    // Função para atualizar indicador de variação
    function atualizarIndicadorVariacao(element, valor, inverter = false) {
        if (!element || valor === undefined) return;
        
        let isPositive = valor >= 0;
        if (inverter) isPositive = !isPositive;
        
        element.className = `dashboard-card-change ${isPositive ? 'positive' : 'negative'}`;
        element.innerHTML = `${valor >= 0 ? '+' : ''}${valor}% <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>`;
    }
    
    // Função para criar linha de solicitação
    function criarLinhaSolicitacao(solicitacao) {
        const tr = document.createElement('tr');
        
        // Definir classe de status
        let statusClass = 'status-pending';
        let statusText = 'Pendente';
        
        if (solicitacao.status === 'aprovada') {
            statusClass = 'status-approved';
            statusText = 'Aprovada';
        } else if (solicitacao.status === 'recusada') {
            statusClass = 'status-rejected';
            statusText = 'Recusada';
        }
        
        // Criar HTML da linha
        tr.innerHTML = `
            <td>#${solicitacao.id}</td>
            <td>${solicitacao.beneficiario_nome}</td>
            <td>${solicitacao.categoria_nome}</td>
            <td>${solicitacao.descricao.substring(0, 50)}${solicitacao.descricao.length > 50 ? '...' : ''}</td>
            <td>${new Date(solicitacao.data_criacao).toLocaleDateString()}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    ${solicitacao.status === 'pendente' ? `
                        <button class="btn btn-sm btn-secondary aprovar-solicitacao" data-id="${solicitacao.id}">Aprovar</button>
                        <button class="btn btn-sm btn-outline recusar-solicitacao" data-id="${solicitacao.id}">Recusar</button>
                    ` : `
                        <button class="btn btn-sm ver-detalhes" data-id="${solicitacao.id}">Ver Detalhes</button>
                    `}
                </div>
            </td>
        `;
        
        // Adicionar eventos aos botões
        const aprovarBtn = tr.querySelector('.aprovar-solicitacao');
        if (aprovarBtn) {
            aprovarBtn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                
                try {
                    await window.requestService.atualizarStatusSolicitacao(id, 'aprovada');
                    alert(`Solicitação #${id} aprovada com sucesso!`);
                    
                    // Atualizar linha na tabela
                    const statusCell = tr.querySelector('.status');
                    statusCell.className = 'status status-approved';
                    statusCell.textContent = 'Aprovada';
                    
                    tr.querySelector('.action-buttons').innerHTML = `
                        <button class="btn btn-sm ver-detalhes" data-id="${id}">Ver Detalhes</button>
                    `;
                } catch (error) {
                    console.error('Erro ao aprovar solicitação:', error);
                    alert('Erro ao aprovar solicitação. Por favor, tente novamente.');
                }
            });
        }
        
        const recusarBtn = tr.querySelector('.recusar-solicitacao');
        if (recusarBtn) {
            recusarBtn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                
                const motivo = prompt(`Por favor, informe o motivo da recusa da solicitação #${id}:`);
                if (!motivo) return;
                
                try {
                    await window.requestService.atualizarStatusSolicitacao(id, 'recusada', motivo);
                    alert(`Solicitação #${id} recusada com sucesso!`);
                    
                    // Atualizar linha na tabela
                    const statusCell = tr.querySelector('.status');
                    statusCell.className = 'status status-rejected';
                    statusCell.textContent = 'Recusada';
                    
                    tr.querySelector('.action-buttons').innerHTML = `
                        <button class="btn btn-sm ver-detalhes" data-id="${id}">Ver Detalhes</button>
                    `;
                } catch (error) {
                    console.error('Erro ao recusar solicitação:', error);
                    alert('Erro ao recusar solicitação. Por favor, tente novamente.');
                }
            });
        }
        
        const verDetalhesBtn = tr.querySelector('.ver-detalhes');
        if (verDetalhesBtn) {
            verDetalhesBtn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                window.location.href = `solicitacao-detalhes.html?id=${id}`;
            });
        }
        
        return tr;
    }
    
    // Função para criar linha de doação
    function criarLinhaDoacao(doacao) {
        const tr = document.createElement('tr');
        
        // Definir classe de status
        let statusClass = 'status-disponivel';
        let statusText = 'Disponível';
        
        if (doacao.status === 'reservado') {
            statusClass = 'status-reservado';
            statusText = 'Reservado';
        } else if (doacao.status === 'entregue') {
            statusClass = 'status-entregue';
            statusText = 'Entregue';
        }
        
        // Criar HTML da linha
        tr.innerHTML = `
            <td>#${doacao.id}</td>
            <td>${doacao.doador_nome}</td>
            <td>${doacao.nome}</td>
            <td>${doacao.categoria_nome}</td>
            <td>${new Date(doacao.data_criacao).toLocaleDateString()}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm ver-detalhes" data-id="${doacao.id}">Ver Detalhes</button>
                </div>
            </td>
        `;
        
        // Adicionar evento ao botão de ver detalhes
        const verDetalhesBtn = tr.querySelector('.ver-detalhes');
        if (verDetalhesBtn) {
            verDetalhesBtn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                window.location.href = `doacao-detalhes.html?id=${id}`;
            });
        }
        
        return tr;
    }
    
    // Adicionar evento ao botão de logout
    const logoutBtn = document.querySelector('.sidebar-menu li:last-child a');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.authService.realizarLogout();
            window.location.href = 'home.html';
        });
    }
});
