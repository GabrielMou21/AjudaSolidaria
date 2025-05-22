// Arquivo de integração para autenticação

const API_BASE_URL = 'http://localhost:3000/api';

// Função para realizar login
async function realizarLogin(email, senha) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        // Armazenar token e informações do usuário no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.nome);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userType', data.user.tipo);
        localStorage.setItem('isLoggedIn', 'true');

        return data;
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

// Função para realizar cadastro
async function realizarCadastro(dadosUsuario) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosUsuario)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao realizar cadastro');
        }

        return data;
    } catch (error) {
        console.error('Erro no cadastro:', error);
        throw error;
    }
}

// Função para obter perfil do usuário
async function obterPerfil() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter perfil');
        }

        return data.user;
    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        throw error;
    }
}

// Função para atualizar perfil do usuário
async function atualizarPerfil(dadosPerfil) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosPerfil)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar perfil');
        }

        return data;
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
    }
}

// Função para alterar senha
async function alterarSenha(senhaAtual, novaSenha) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao alterar senha');
        }

        return data;
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        throw error;
    }
}

// Função para verificar se o usuário está autenticado
function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    return token && isLoggedIn === 'true';
}

// Função para realizar logout
function realizarLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
}

// Exportar funções
window.authService = {
    realizarLogin,
    realizarCadastro,
    obterPerfil,
    atualizarPerfil,
    alterarSenha,
    verificarAutenticacao,
    realizarLogout
};
