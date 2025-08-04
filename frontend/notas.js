document.addEventListener('DOMContentLoaded', () => {
    // A URL base da nossa API do FastAPI
    const API_URL = 'http://127.0.0.1:8000';

    // Obter o ID do usuário do localStorage
    const currentUserId = localStorage.getItem('user_id');

    // Elementos HTML
    const form = document.getElementById('note-form');
    const titleInput = document.getElementById('title-input');
    const contentTextarea = document.getElementById('content-textarea');
    const notesList = document.getElementById('notes-list');
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

    // Função para buscar e exibir as notas da API
    async function fetchAndDisplayNotes() {
        try {
            const response = await fetch(`${API_URL}/notas/${currentUserId}`);
            const notes = await response.json();

            notesList.innerHTML = ''; // Limpa a lista antes de adicionar
            if (notes.length === 0) {
                notesList.innerHTML = '<p>Nenhuma nota cadastrada.</p>';
            } else {
                notes.forEach(note => {
                    const noteCard = document.createElement('li');
                    noteCard.className = 'note-card';
                    noteCard.innerHTML = `
                        <div class="note-info">
                            <h3 class="title">${note.titulo}</h3>
                            <p>${note.conteudo}</p>
                        </div>
                        <button class="delete-btn" data-id="${note.id}">❌</button>
                    `;
                    notesList.appendChild(noteCard);
                });
                // Adicionar event listeners aos botões de deletar
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', deleteNote);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar notas:', error);
            showMessage('Erro ao carregar notas.', true);
        }
    }

    // Função para adicionar uma nova nota
    async function createNote(event) {
        event.preventDefault();

        const titulo = titleInput.value;
        const conteudo = contentTextarea.value;

        const noteData = {
            user_id: currentUserId,
            titulo: titulo,
            conteudo: conteudo
        };

        try {
            const response = await fetch(`${API_URL}/notas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                showMessage('Nota adicionada com sucesso!');
                form.reset();
                fetchAndDisplayNotes();
            } else {
                showMessage('Erro ao adicionar nota.', true);
            }
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Função para deletar uma nota
    async function deleteNote(event) {
        const noteId = event.target.dataset.id;
        try {
            const response = await fetch(`${API_URL}/notas/${noteId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('Nota excluída com sucesso!');
                fetchAndDisplayNotes();
            } else {
                showMessage('Erro ao excluir nota.', true);
            }
        } catch (error) {
            console.error('Erro ao excluir nota:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Event Listeners
    if (form) {
        form.addEventListener('submit', createNote);
    }

    // Inicializar a lista de notas quando a página carrega
    window.addEventListener('load', () => {
        fetchAndDisplayNotes();
    });
});
