// Arquivo de integração para solicitar.html

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType");
    const userName = localStorage.getItem("userName");
    
    // Configurar seções de login/cadastro
    if (isLoggedIn && (userType === "beneficiario" || userType === "organizacao")) {
        document.getElementById("login-section").style.display = "block";
        document.getElementById("cadastro-section").style.display = "none";
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("user-name").textContent = userName || "Usuário";
    } else {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("cadastro-section").style.display = "block";
        document.getElementById("login-btn").style.display = "inline-block";
    }
    
    // Carregar categorias para o formulário
    try {
        const categorias = await window.categoryService.listarCategorias();
        
        // Preencher select de categorias
        const categoriaSelect = document.getElementById('categoria');
        if (categoriaSelect) {
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
    
    // Verificar se há um item pré-selecionado (vindo da página de doações)
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('item');
    
    if (itemId) {
        try {
            // Obter detalhes do item
            const item = await window.itemService.obterItem(itemId);
            
            // Preencher formulário com dados do item
            if (item) {
                document.getElementById('categoria').value = item.categoria_id;
                document.getElementById('descricao').value = `Estou solicitando o item "${item.nome}" (ID: ${item.id}).\n\nDetalhes do item: ${item.descricao}`;
                document.getElementById('quantidade').value = item.quantidade;
            }
        } catch (error) {
            console.error('Erro ao obter detalhes do item:', error);
        }
    }
    
    // Formulário de solicitação
    const solicitarForm = document.getElementById('solicitar-form');
    if (solicitarForm) {
        solicitarForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const categoriaId = document.getElementById('categoria').value;
            const descricao = document.getElementById('descricao').value;
            const quantidade = document.getElementById('quantidade').value;
            const urgencia = document.getElementById('urgencia').value;
            
            // Preparar dados da solicitação
            const dadosSolicitacao = {
                categoria_id: categoriaId,
                descricao,
                quantidade,
                urgencia,
                item_id: itemId || null
            };
            
            // Se o usuário não estiver logado, coletar dados de cadastro
            if (!isLoggedIn) {
                dadosSolicitacao.cadastro = {
                    nome: document.getElementById('nome').value,
                    cpf: document.getElementById('cpf').value,
                    email: document.getElementById('email').value,
                    telefone: document.getElementById('telefone').value,
                    endereco: document.getElementById('endereco').value,
                    cidade: document.getElementById('cidade').value,
                    estado: document.getElementById('estado').value,
                    cep: document.getElementById('cep').value,
                    renda_familiar: document.getElementById('renda_familiar').value,
                    num_dependentes: document.getElementById('num_dependentes').value,
                    situacao_moradia: document.getElementById('situacao_moradia').value,
                    tipo_usuario: 'beneficiario'
                };
            }
            
            // Mostrar indicador de carregamento
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            try {
                // Se não estiver logado, criar conta primeiro
                if (!isLoggedIn) {
                    try {
                        // Criar conta de beneficiário
                        const resultadoCadastro = await window.authService.realizarCadastro(dadosSolicitacao.cadastro);
                        
                        // Login automático
                        const resultadoLogin = await window.authService.realizarLogin(
                            dadosSolicitacao.cadastro.email, 
                            dadosSolicitacao.cadastro.senha || '123456' // Senha padrão para demonstração
                        );
                        
                        console.log('Cadastro e login realizados com sucesso:', resultadoLogin);
                    } catch (cadastroError) {
                        console.error('Erro ao criar conta:', cadastroError);
                        throw new Error('Não foi possível criar sua conta. Por favor, tente novamente.');
                    }
                }
                
                // Enviar solicitação
                const resultado = await window.requestService.criarSolicitacao(dadosSolicitacao);
                
                // Solicitação enviada com sucesso
                console.log('Solicitação enviada com sucesso:', resultado);
                
                // Redirecionar para página de confirmação
                window.location.href = 'resposta.html?tipo=solicitacao&status=sucesso';
                
            } catch (error) {
                // Exibir mensagem de erro
                console.error('Erro ao enviar solicitação:', error);
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger';
                errorMessage.textContent = error.message || 'Erro ao enviar solicitação. Por favor, tente novamente.';
                
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
});
