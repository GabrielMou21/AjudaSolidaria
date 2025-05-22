// Arquivo de integração para doacoes.html

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se o usuário está logado como doador
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType");
    
    // Mostrar/ocultar seção de cadastro de doação
    const cadastrarDoacaoSection = document.querySelector(".cadastrar-doacoes-section");
    if (cadastrarDoacaoSection) {
        if (isLoggedIn && userType === "doador") {
            cadastrarDoacaoSection.style.display = "block";
        } else {
            cadastrarDoacaoSection.style.display = "none";
        }
    }
    
    // Carregar categorias para os filtros e formulário
    try {
        const categorias = await window.categoryService.listarCategorias();
        
        // Preencher select de categorias no filtro
        const categoriaFilter = document.getElementById('categoria-filter');
        if (categoriaFilter) {
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaFilter.appendChild(option);
            });
        }
        
        // Preencher select de categorias no formulário de cadastro
        const categoriaItem = document.getElementById('categoria-item');
        if (categoriaItem) {
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaItem.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
    
    // Carregar itens/doações
    try {
        const itens = await window.itemService.listarItens({ status: 'disponivel' });
        
        // Limpar grid de doações
        const doacoesGrid = document.querySelector('.doacoes-grid');
        if (doacoesGrid) {
            doacoesGrid.innerHTML = '';
            
            // Verificar se há itens
            if (itens.length === 0) {
                doacoesGrid.innerHTML = '<p class="no-items">Nenhum item disponível no momento.</p>';
            } else {
                // Renderizar itens
                itens.forEach(item => {
                    const itemCard = criarCardItem(item);
                    doacoesGrid.appendChild(itemCard);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
    }
    
    // Formulário de cadastro de doação
    const doacaoForm = document.getElementById('doacao-form');
    if (doacaoForm) {
        doacaoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!isLoggedIn || userType !== 'doador') {
                alert('Você precisa estar logado como doador para cadastrar doações.');
                window.location.href = 'login.html';
                return;
            }
            
            // Obter dados do formulário
            const nome = document.getElementById('nome-item').value;
            const categoriaId = document.getElementById('categoria-item').value;
            const quantidade = document.getElementById('quantidade-item').value;
            const descricao = document.getElementById('descricao-item').value;
            const estadoConservacao = document.getElementById('estado-conservacao').value;
            
            // Preparar dados do item
            const dadosItem = {
                nome,
                categoria_id: categoriaId,
                quantidade,
                descricao,
                estado_conservacao: estadoConservacao,
                status: 'disponivel'
            };
            
            // Mostrar indicador de carregamento
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
            
            try {
                // Chamar serviço de itens
                const resultado = await window.itemService.cadastrarItem(dadosItem);
                
                // Cadastro bem-sucedido
                console.log('Doação cadastrada com sucesso:', resultado);
                
                // Redirecionar para página de confirmação
                window.location.href = 'resposta.html?tipo=doacao&status=sucesso';
                
            } catch (error) {
                // Exibir mensagem de erro
                console.error('Erro ao cadastrar doação:', error);
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger';
                errorMessage.textContent = 'Erro ao cadastrar doação. Por favor, tente novamente.';
                
                const formActions = this.querySelector('.form-actions');
                formActions.insertAdjacentElement('beforebegin', errorMessage);
                
                // Remover mensagem após 5 segundos
                setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
                
                // Restaurar botão
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
    
    // Filtrar doações
    const filterButton = document.getElementById('filter-button');
    if (filterButton) {
        filterButton.addEventListener('click', async function() {
            const searchTerm = document.getElementById('search-input').value;
            const categoriaId = document.getElementById('categoria-filter').value;
            const status = document.getElementById('status-filter').value;
            
            try {
                const filtros = {};
                if (searchTerm) filtros.termo = searchTerm;
                if (categoriaId) filtros.categoria_id = categoriaId;
                if (status) filtros.status = status;
                
                const itens = await window.itemService.listarItens(filtros);
                
                // Limpar grid de doações
                const doacoesGrid = document.querySelector('.doacoes-grid');
                if (doacoesGrid) {
                    doacoesGrid.innerHTML = '';
                    
                    // Verificar se há itens
                    if (itens.length === 0) {
                        doacoesGrid.innerHTML = '<p class="no-items">Nenhum item encontrado com os filtros selecionados.</p>';
                    } else {
                        // Renderizar itens
                        itens.forEach(item => {
                            const itemCard = criarCardItem(item);
                            doacoesGrid.appendChild(itemCard);
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao filtrar itens:', error);
                alert('Erro ao filtrar itens. Por favor, tente novamente.');
            }
        });
    }
    
    // Limpar filtros
    const clearFiltersButton = document.getElementById('clear-filters');
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', async function() {
            document.getElementById('search-input').value = '';
            document.getElementById('categoria-filter').value = '';
            document.getElementById('status-filter').value = 'disponivel';
            
            // Recarregar itens
            try {
                const itens = await window.itemService.listarItens({ status: 'disponivel' });
                
                // Limpar grid de doações
                const doacoesGrid = document.querySelector('.doacoes-grid');
                if (doacoesGrid) {
                    doacoesGrid.innerHTML = '';
                    
                    // Verificar se há itens
                    if (itens.length === 0) {
                        doacoesGrid.innerHTML = '<p class="no-items">Nenhum item disponível no momento.</p>';
                    } else {
                        // Renderizar itens
                        itens.forEach(item => {
                            const itemCard = criarCardItem(item);
                            doacoesGrid.appendChild(itemCard);
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao recarregar itens:', error);
            }
        });
    }
    
    // Função para criar card de item
    function criarCardItem(item) {
        const card = document.createElement('div');
        card.className = 'doacao-card card';
        
        // Definir classe de status
        let statusClass = 'status-disponivel';
        if (item.status === 'reservado') statusClass = 'status-reservado';
        if (item.status === 'entregue') statusClass = 'status-entregue';
        
        // Criar HTML do card
        card.innerHTML = `
            <div class="doacao-img">
                <img src="${item.imagem || '../assets/item-default.jpg'}" alt="${item.nome}">
                <span class="status-badge ${statusClass}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
            </div>
            <div class="doacao-content">
                <h4>${item.nome}</h4>
                <p class="doacao-categoria"><i class="fas fa-tag"></i> ${item.categoria_nome || 'Categoria'}</p>
                <p class="doacao-descricao">${item.descricao}</p>
                <div class="doacao-meta">
                    <span><i class="fas fa-box"></i> Quantidade: ${item.quantidade}</span>
                    <span><i class="fas fa-star"></i> Estado: ${item.estado_conservacao}</span>
                </div>
                <div class="doacao-actions">
                    <a href="doacao-detalhes.html?id=${item.id}" class="btn btn-sm">Ver Detalhes</a>
                    ${item.status === 'disponivel' ? `<button class="btn btn-sm btn-secondary solicitar-doacao" data-id="${item.id}">Solicitar</button>` : ''}
                </div>
            </div>
        `;
        
        // Adicionar evento ao botão de solicitar
        const solicitarBtn = card.querySelector('.solicitar-doacao');
        if (solicitarBtn) {
            solicitarBtn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                
                if (isLoggedIn && (userType === 'beneficiario' || userType === 'organizacao')) {
                    window.location.href = `solicitar.html?item=${itemId}`;
                } else {
                    alert('Você precisa estar logado como beneficiário ou organização para solicitar doações.');
                    window.location.href = 'login.html';
                }
            });
        }
        
        return card;
    }
});
