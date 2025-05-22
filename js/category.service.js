// Arquivo de integração para categorias

// URL base da API
const API_BASE_URL = 'http://localhost:3000/api';

// Função para listar todas as categorias
async function listarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao listar categorias');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        throw error;
    }
}

// Função para obter detalhes de uma categoria específica
async function obterCategoria(categoriaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoriaId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao obter categoria');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao obter categoria:', error);
        throw error;
    }
}

// Função para criar uma nova categoria (requer autenticação de admin)
async function criarCategoria(dadosCategoria) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosCategoria)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao criar categoria');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
    }
}

// Função para atualizar uma categoria existente (requer autenticação de admin)
async function atualizarCategoria(categoriaId, dadosCategoria) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/categories/${categoriaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosCategoria)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar categoria');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        throw error;
    }
}

// Função para excluir uma categoria (requer autenticação de admin)
async function excluirCategoria(categoriaId) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`${API_BASE_URL}/categories/${categoriaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao excluir categoria');
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        throw error;
    }
}

// Exportar funções
window.categoryService = {
    listarCategorias,
    obterCategoria,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria
};
