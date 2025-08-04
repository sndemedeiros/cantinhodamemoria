document.addEventListener('DOMContentLoaded', () => {
    // A URL base da nossa API do FastAPI
    const API_URL = 'http://127.0.0.1:8000';

    // Obter o ID do usuário do localStorage
    const currentUserId = localStorage.getItem('user_id');

    // Elementos HTML
    const form = document.getElementById('memory-form');
    const titleInput = document.getElementById('title-input');
    const dateInput = document.getElementById('date-input');
    const descriptionInput = document.getElementById('description-input');
    const imageInput = document.getElementById('image-input');
    const memoriesList = document.getElementById('memories-list');
    const messageBox = document.getElementById('message-box');

    // Verificar se o usuário está logado, caso contrário redireciona
    if (!currentUserId) {
        window.location.href = 'login.html';
        return;
    }

    /**
     * Exibe uma mensagem de feedback na tela.
     * @param {string} message - A mensagem a ser exibida.
     * @param {boolean} isError - Indica se é uma mensagem de erro.
     */
    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.className = isError ? 'message-box error' : 'message-box success';
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000); // Esconde a mensagem depois de 5 segundos
    }

    // Função para buscar e exibir as memórias da API
    async function fetchAndDisplayMemories() {
        try {
            const response = await fetch(`${API_URL}/memorias/${currentUserId}`);
            const memories = await response.json();

            memoriesList.innerHTML = ''; // Limpa a lista antes de adicionar
            if (memories.length === 0) {
                memoriesList.innerHTML = '<p>Nenhuma memória cadastrada.</p>';
            } else {
                memories.forEach(memory => {
                    const memoryCard = document.createElement('li');
                    memoryCard.className = 'memory-card';

                    // --- CORREÇÃO: Verificando se a URL é Base64 ou um caminho de arquivo ---
                    const imageUrl = memory.imagem_url
                        ? (memory.imagem_url.startsWith('data:') ? memory.imagem_url : `${API_URL}/${memory.imagem_url}`)
                        : null;

                    memoryCard.innerHTML = `
                        <div class="memory-info">
                            <h3 class="title">${memory.titulo}</h3>
                            <p class="date">${memory.data}</p>
                            <p>${memory.descricao}</p>
                            <!-- Adiciona a imagem se o URL for válido. O onerror exibe um placeholder se o URL estiver quebrado. -->
                            ${imageUrl ? `<img src="${imageUrl}" alt="Imagem da memória" class="memory-image" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Sem+Imagem';">` : `<img src="https://placehold.co/100x100?text=Sem+Imagem" alt="Sem imagem" class="memory-image">`}
                        </div>
                        <button class="delete-btn" data-id="${memory.id}">❌</button>
                    `;
                    memoriesList.appendChild(memoryCard);
                });
                // Adicionar event listeners aos botões de deletar
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', deleteMemory);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar memórias:', error);
            showMessage('Erro ao carregar memórias.', true);
        }
    }

    // Função para adicionar uma nova memória
    async function createMemory(event) {
        event.preventDefault();

        // Verificação do limite de memórias antes de adicionar
        try {
            const response = await fetch(`${API_URL}/memorias/${currentUserId}`);
            const memories = await response.json();
            if (memories.length >= 5) {
                showMessage('Limite de 5 memórias atingido. Não é possível adicionar mais fotos.', true);
                return; // Impede a continuação da função
            }
        } catch (error) {
            console.error('Erro ao verificar o limite de memórias:', error);
            showMessage('Erro ao verificar o limite de memórias.', true);
            return; // Impede a continuação da função em caso de erro
        }

        const titulo = titleInput.value;
        const data = dateInput.value;
        const descricao = descriptionInput.value;
        const imagemFile = imageInput.files[0];

        const formData = new FormData();
        formData.append('user_id', currentUserId);
        formData.append('titulo', titulo);
        formData.append('data', data);
        formData.append('descricao', descricao);
        if (imagemFile) {
            formData.append('imagem', imagemFile);
        }

        try {
            const response = await fetch(`${API_URL}/memorias`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showMessage('Memória adicionada com sucesso!');
                form.reset();
                fetchAndDisplayMemories();
            } else {
                showMessage('Erro ao adicionar memória.', true);
            }
        } catch (error) {
            console.error('Erro ao adicionar memória:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Função para deletar uma memória
    async function deleteMemory(event) {
        const memoryId = event.target.dataset.id;
        try {
            const response = await fetch(`${API_URL}/memorias/${memoryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('Memória excluída com sucesso!');
                fetchAndDisplayMemories();
            } else {
                showMessage('Erro ao excluir memória.', true);
            }
        } catch (error) {
            console.error('Erro ao excluir memória:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Event Listeners
    if (form) {
        form.addEventListener('submit', createMemory);
    }

    // Inicializar a lista de memórias quando a página carrega
    window.addEventListener('load', () => {
        fetchAndDisplayMemories();
    });
});
