// Arquivo de integração para solicitações

// URL base da API
const API_BASE_URL = 'http://localhost:3000/api';

// Função para listar todas as solicitações
async function listarSolicitacoes(filtros = {}) {
    try {
        let url = `${API_BASE_URL}/requests`;
        
        // Adicionar parâmetros de filtro à URL se existirem
        if (Object.keys(filtros).length > 0) {
            url += '/search?';
            const params = new URLSearchParams();
            
            if (filtros.termo) params.append('termo', filtros.termo);
            if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
            if (filtros.status) params.append('status', filtros.status);
            if (filtros.urgencia) params.append('urgencia', filtros.urgencia);
            
            url += params.toString();
        }
        
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(url, { headers });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao listar solicitações');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao listar solicitações:', error);
        throw error;
    }
}

// Função para obter detalhes de uma solicitação específica
async function obterSolicitacao(solicitacaoId) {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/requests/${solicitacaoId}`, { headers });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter solicitação');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter solicitação:', error);
        throw error;
    }
}

// Função para criar uma nova solicitação (requer autenticação)
async function criarSolicitacao(dadosSolicitacao) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosSolicitacao)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao criar solicitação');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao criar solicitação:', error);
        throw error;
    }
}

// Função para atualizar uma solicitação existente (requer autenticação)
async function atualizarSolicitacao(solicitacaoId, dadosSolicitacao) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/requests/${solicitacaoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosSolicitacao)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar solicitação');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao atualizar solicitação:', error);
        throw error;
    }
}

// Função para atualizar o status de uma solicitação (requer autenticação de admin)
async function atualizarStatusSolicitacao(solicitacaoId, status, motivoRecusa = null) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const dadosStatus = { status };
        if (status === 'recusada' && motivoRecusa) {
            dadosStatus.motivo_recusa = motivoRecusa;
        }
        
        const response = await fetch(`${API_BASE_URL}/requests/status/${solicitacaoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosStatus)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar status da solicitação');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao atualizar status da solicitação:', error);
        throw error;
    }
}

// Função para excluir uma solicitação (requer autenticação)
async function excluirSolicitacao(solicitacaoId) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/requests/${solicitacaoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao excluir solicitação');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao excluir solicitação:', error);
        throw error;
    }
}

// Função para listar solicitações por beneficiário (requer autenticação)
async function listarSolicitacoesPorBeneficiario(beneficiarioId = null) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const url = beneficiarioId 
            ? `${API_BASE_URL}/requests/beneficiary/${beneficiarioId}` 
            : `${API_BASE_URL}/requests/beneficiary`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao listar solicitações do beneficiário');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao listar solicitações do beneficiário:', error);
        throw error;
    }
}

// Exportar funções
window.requestService = {
    listarSolicitacoes,
    obterSolicitacao,
    criarSolicitacao,
    atualizarSolicitacao,
    atualizarStatusSolicitacao,
    excluirSolicitacao,
    listarSolicitacoesPorBeneficiario
};
