// Arquivo de integração para itens/doações

const API_BASE_URL = 'http://localhost:3000/api';

// Função para listar todos os itens disponíveis
async function listarItens(filtros = {}) {
    try {
        let url = `${API_BASE_URL}/items`;
        
        // Adicionar parâmetros de filtro à URL se existirem
        if (Object.keys(filtros).length > 0) {
            url += '/search?';
            const params = new URLSearchParams();
            
            if (filtros.termo) params.append('termo', filtros.termo);
            if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
            if (filtros.status) params.append('status', filtros.status);
            
            url += params.toString();
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao listar itens');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao listar itens:', error);
        throw error;
    }
}

// Função para obter detalhes de um item específico
async function obterItem(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter item');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter item:', error);
        throw error;
    }
}

// Função para cadastrar um novo item (requer autenticação)
async function cadastrarItem(dadosItem) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosItem)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao cadastrar item');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao cadastrar item:', error);
        throw error;
    }
}

// Função para atualizar um item existente (requer autenticação)
async function atualizarItem(itemId, dadosItem) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosItem)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar item');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        throw error;
    }
}

// Função para excluir um item (requer autenticação)
async function excluirItem(itemId) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao excluir item');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        throw error;
    }
}

// Função para listar itens por doador (requer autenticação)
async function listarItensPorDoador(doadorId = null) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const url = doadorId 
            ? `${API_BASE_URL}/items/donor/${doadorId}` 
            : `${API_BASE_URL}/items/donor`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao listar itens do doador');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao listar itens do doador:', error);
        throw error;
    }
}

// Função para listar itens por categoria
async function listarItensPorCategoria(categoriaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/items/category/${categoriaId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao listar itens por categoria');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao listar itens por categoria:', error);
        throw error;
    }
}

// Exportar funções
window.itemService = {
    listarItens,
    obterItem,
    cadastrarItem,
    atualizarItem,
    excluirItem,
    listarItensPorDoador,
    listarItensPorCategoria
};
