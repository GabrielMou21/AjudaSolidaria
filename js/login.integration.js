// Arquivo de integração para login.html

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário já está logado
    if (window.authService.verificarAutenticacao()) {
        // Redirecionar para o dashboard
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Formulário de login
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            
            // Mostrar indicador de carregamento
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            
            try {
                // Chamar serviço de autenticação
                const resultado = await window.authService.realizarLogin(email, senha);
                
                // Login bem-sucedido
                console.log('Login realizado com sucesso:', resultado);
                
                // Redirecionar com base no tipo de usuário
                const userType = localStorage.getItem('userType');
                
                if (userType === 'administrador') {
                    window.location.href = 'dashboard.html';
                } else if (userType === 'doador') {
                    window.location.href = 'dashboard.html';
                } else if (userType === 'beneficiario') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'home.html';
                }
                
            } catch (error) {
                // Exibir mensagem de erro
                console.error('Erro no login:', error);
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger';
                errorMessage.textContent = 'Email ou senha incorretos. Por favor, tente novamente.';
                
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
    
    // Botão "Esqueci minha senha"
    const forgotPasswordBtn = document.getElementById('forgot-password');
    
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            
            if (!email) {
                alert('Por favor, informe seu email para recuperar a senha.');
                return;
            }
            
            // Simulação de envio de email de recuperação
            alert(`Um email de recuperação de senha foi enviado para ${email}. Por favor, verifique sua caixa de entrada.`);
        });
    }
});
