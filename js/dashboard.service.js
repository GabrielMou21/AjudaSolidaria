// Arquivo de integração para dashboard

// URL base da API
const API_BASE_URL = 'http://localhost:3000/api';

// Função para obter estatísticas gerais (requer autenticação)
async function obterEstatisticas() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter estatísticas');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        throw error;
    }
}

// Função para obter solicitações recentes (requer autenticação)
async function obterSolicitacoesRecentes(limite = 5) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/dashboard/recent-requests?limit=${limite}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter solicitações recentes');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter solicitações recentes:', error);
        throw error;
    }
}

// Função para obter doações recentes (requer autenticação)
async function obterDoacoesRecentes(limite = 5) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/dashboard/recent-donations?limit=${limite}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter doações recentes');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter doações recentes:', error);
        throw error;
    }
}

// Função para obter estatísticas por categoria (requer autenticação)
async function obterEstatisticasPorCategoria() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/dashboard/category-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter estatísticas por categoria');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter estatísticas por categoria:', error);
        throw error;
    }
}

// Função para obter estatísticas de usuários (requer autenticação de admin)
async function obterEstatisticasUsuarios() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/dashboard/user-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter estatísticas de usuários');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter estatísticas de usuários:', error);
        throw error;
    }
}

// Exportar funções
window.dashboardService = {
    obterEstatisticas,
    obterSolicitacoesRecentes,
    obterDoacoesRecentes,
    obterEstatisticasPorCategoria,
    obterEstatisticasUsuarios
};
