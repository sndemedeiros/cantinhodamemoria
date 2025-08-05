// memorias.js - Lógica específica para a página de memórias

// Importa as funções apiRequest e showMessage do arquivo api.js
import { apiRequest, showMessage } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-btn');
    const memoryForm = document.getElementById('memory-form'); // ID do formulário de memórias
    const memoriesList = document.getElementById('memories-list'); // ID da sua lista de memórias

    const userId = localStorage.getItem('user_id');

    // Redireciona se o usuário não estiver logado
    if (!userId) {
        showMessage('Você precisa estar logado para acessar esta página.', true);
        // Pequeno atraso para a mensagem aparecer antes de redirecionar
        setTimeout(() => {
            window.location.href = 'index.html'; // Redireciona para a página de login
        }, 1500);
        return; // Interrompe a execução do script
    }

    // Atualiza a mensagem de boas-vindas
    if (welcomeMessage) {
        welcomeMessage.textContent = `Olá, ${userId}`;
    }

    // Lógica para Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user_id'); // Remove o user_id do localStorage
            window.location.href = 'index.html'; // Redireciona para a página de login
        });
    }

    // Função para carregar e exibir memórias
    async function loadMemories() {
        if (!userId) return; // Garante que há um userId antes de tentar carregar

        try {
            // Exibe "Carregando memórias..." enquanto a requisição é feita
            memoriesList.innerHTML = '<p>Carregando memórias...</p>';

            // Usa a função apiRequest importada
            const memories = await apiRequest(`memorias/${userId}`);
            memoriesList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (memories.length === 0) {
                memoriesList.innerHTML = '<p>Nenhuma memória encontrada. Crie uma nova!</p>';
            } else {
                memories.forEach(memory => {
                    const li = document.createElement('li');
                    li.className = 'memory-card'; // Mantém a classe para o seu CSS

                    // Decide se a imagem é Base64 ou um URL (assumindo que o backend retorna Base64 ou um caminho relativo)
                    const imageUrl = memory.imagem_url
                        ? (memory.imagem_url.startsWith('data:') ? memory.imagem_url : `https://cantinho-da-memoria-backend.onrender.com/${memory.imagem_url}`)
                        : 'https://placehold.co/100x100?text=Sem+Imagem'; // Placeholder se não houver imagem

                    li.innerHTML = `
                        <div class="item-info">
                            <h3 class="title">${memory.titulo}</h3>
                            <p class="date">${memory.data}</p>
                            <p>${memory.descricao}</p>
                            <img src="${imageUrl}" alt="Imagem da memória" class="memory-image" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Erro+Imagem';">
                        </div>
                        <button class="delete-btn" data-id="${memory.id}"><i class="fas fa-trash-alt"></i></button>
                    `;
                    memoriesList.appendChild(li);
                });

                // Adiciona event listeners para os botões de exclusão
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.onclick = async (event) => {
                        const memoryId = event.currentTarget.dataset.id; // Usar currentTarget
                        try {
                            await apiRequest(`memorias/${memoryId}`, 'DELETE');
                            showMessage('Memória excluída com sucesso!', false);
                            loadMemories(); // Recarrega a lista
                        } catch (error) {
                            console.error('Erro ao excluir memória:', error);
                            showMessage('Erro ao excluir memória.', true);
                        }
                    };
                });
            }
        } catch (error) {
            console.error('Erro ao carregar memórias:', error);
            showMessage('Erro ao carregar memórias.', true);
        }
    }

    // Lógica para adicionar nova memória
    if (memoryForm) {
        memoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Verificação do limite de memórias antes de adicionar
            try {
                const existingMemories = await apiRequest(`memorias/${userId}`);
                if (existingMemories.length >= 5) {
                    showMessage('Limite de 5 memórias atingido. Não é possível adicionar mais fotos.', true);
                    return; // Impede a continuação da função
                }
            } catch (error) {
                console.error('Erro ao verificar o limite de memórias:', error);
                showMessage('Erro ao verificar o limite de memórias.', true);
                return; // Impede a continuação da função em caso de erro
            }

            const titulo = document.getElementById('title-input').value;
            const data = document.getElementById('date-input').value;
            const descricao = document.getElementById('description-input').value;
            const imagemFile = document.getElementById('image-input').files[0];

            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('titulo', titulo);
            formData.append('data', data);
            formData.append('descricao', descricao);
            if (imagemFile) {
                formData.append('imagem', imagemFile);
            }

            try {
                // Para FormData, apiRequest precisa de um ajuste ou uma chamada fetch direta como antes
                // Vamos usar fetch direto aqui para FormData, mas com tratamento de erro similar
                const response = await fetch(`https://cantinho-da-memoria-backend.onrender.com/memorias`, {
                    method: 'POST',
                    body: formData // FormData não precisa de 'Content-Type' no header, o browser adiciona
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Erro ao adicionar memória.');
                }

                showMessage('Memória adicionada com sucesso!', false);
                memoryForm.reset();
                loadMemories(); // Recarrega a lista de memórias
            } catch (error) {
                console.error('Erro ao adicionar memória:', error);
                showMessage(`Erro ao adicionar memória: ${error.message}.`, true);
            }
        });
    }

    // Carrega as memórias ao carregar a página (após todas as definições)
    loadMemories();
});
