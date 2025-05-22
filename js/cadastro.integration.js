// Arquivo de integração para cadastro.html

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário já está logado
    if (window.authService.verificarAutenticacao()) {
        // Redirecionar para o dashboard
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Formulário de cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const tipoUsuario = document.getElementById('tipo_usuario').value;
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar_senha').value;
            const telefone = document.getElementById('telefone').value;
            const endereco = document.getElementById('endereco').value;
            const cidade = document.getElementById('cidade').value;
            const estado = document.getElementById('estado').value;
            const cep = document.getElementById('cep').value;
            
            // Validar senhas
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            
            // Preparar dados do usuário
            const dadosUsuario = {
                nome,
                email,
                senha,
                telefone,
                endereco,
                cidade,
                estado,
                cep,
                tipo_usuario: tipoUsuario
            };
            
            // Adicionar campos específicos com base no tipo de usuário
            if (tipoUsuario === "doador") {
                dadosUsuario.cpf_cnpj = document.getElementById("cpf_cnpj").value;
                dadosUsuario.tipo_pessoa = document.querySelector('input[name="tipo_pessoa"]:checked').value;
            } else if (tipoUsuario === "beneficiario") {
                dadosUsuario.cpf = document.getElementById("cpf").value;
                dadosUsuario.data_nascimento = document.getElementById("data_nascimento").value;
                dadosUsuario.renda_familiar = document.getElementById("renda_familiar").value;
                dadosUsuario.num_dependentes = document.getElementById("num_dependentes").value;
            } else if (tipoUsuario === "organizacao") {
                dadosUsuario.cnpj = document.getElementById("cnpj").value;
                dadosUsuario.nome_responsavel = document.getElementById("nome_responsavel").value;
                dadosUsuario.area_atuacao = document.getElementById("area_atuacao").value;
                dadosUsuario.site = document.getElementById("site").value;
            }
            
            // Mostrar indicador de carregamento
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
            
            try {
                // Chamar serviço de autenticação
                const resultado = await window.authService.realizarCadastro(dadosUsuario);
                
                // Cadastro bem-sucedido
                console.log('Cadastro realizado com sucesso:', resultado);
                
                // Redirecionar para página de confirmação
                window.location.href = 'resposta.html?tipo=cadastro&status=sucesso';
                
            } catch (error) {
                // Exibir mensagem de erro
                console.error('Erro no cadastro:', error);
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger';
                errorMessage.textContent = 'Erro ao realizar cadastro. Por favor, verifique os dados e tente novamente.';
                
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
    
    // Alternar tipo de usuário
    const userTypeOptions = document.querySelectorAll('.user-type-option');
    
    if (userTypeOptions.length > 0) {
        userTypeOptions.forEach(function(option) {
            option.addEventListener('click', function() {
                // Remover classe ativa de todas as opções
                userTypeOptions.forEach(function(opt) {
                    opt.classList.remove('active');
                });
                
                // Adicionar classe ativa à opção clicada
                this.classList.add('active');
                
                // Atualizar tipo de usuário no formulário
                const tipoUsuario = this.getAttribute('data-type');
                document.getElementById('tipo_usuario').value = tipoUsuario;
                
                // Esconder todos os campos específicos
                document.querySelectorAll('.tipo-fields').forEach(function(fields) {
                    fields.style.display = 'none';
                });
                
                // Mostrar campos específicos do tipo selecionado
                document.querySelector(`.${tipoUsuario}-fields`).style.display = 'block';
            });
        });
    }
});
