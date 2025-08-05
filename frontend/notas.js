// notas.js - Lógica específica para a página de notas

// Importa as funções apiRequest e showMessage do arquivo api.js
import { apiRequest, showMessage } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-btn');
    const noteForm = document.getElementById('note-form'); // ID do formulário de notas
    const notesList = document.getElementById('notes-list'); // ID da sua lista de notas

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

    // Função para carregar e exibir notas
    async function loadNotes() {
        if (!userId) return; // Garante que há um userId antes de tentar carregar

        try {
            // Exibe "Carregando notas..." enquanto a requisição é feita
            notesList.innerHTML = '<p>Carregando notas...</p>';

            // Usa a função apiRequest importada
            const notes = await apiRequest(`notas/${userId}`);
            notesList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (notes.length === 0) {
                notesList.innerHTML = '<p>Nenhuma nota encontrada. Crie uma nova!</p>';
            } else {
                notes.forEach(note => {
                    const li = document.createElement('li');
                    // O seu style.css já estiliza 'item-list li', então não precisamos de className aqui.
                    // As classes 'item-info' e 'delete-btn' já estão no seu CSS.
                    li.innerHTML = `
                        <div class="item-info">
                            <p class="title">${note.titulo}</p>
                            <p>${note.conteudo}</p>
                        </div>
                        <button class="delete-btn" data-id="${note.id}"><i class="fas fa-trash-alt"></i></button>
                    `;
                    notesList.appendChild(li);
                });

                // Adiciona event listeners para os botões de exclusão
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.onclick = async (event) => {
                        const noteId = event.currentTarget.dataset.id; // Usar currentTarget
                        try {
                            await apiRequest(`notas/${noteId}`, 'DELETE');
                            showMessage('Nota excluída com sucesso!', false);
                            loadNotes(); // Recarrega a lista
                        } catch (error) {
                            console.error('Erro ao excluir nota:', error);
                            showMessage('Erro ao excluir nota.', true);
                        }
                    };
                });
            }
        } catch (error) {
            console.error('Erro ao carregar notas:', error);
            showMessage('Erro ao carregar notas.', true);
        }
    }

    // Lógica para adicionar nova nota
    if (noteForm) {
        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('note-title-input').value; // ID do seu input de título
            const conteudo = document.getElementById('note-content-input').value; // ID do seu input de conteúdo

            try {
                await apiRequest('notas', 'POST', { user_id: userId, titulo, conteudo });
                showMessage('Nota adicionada com sucesso!', false);
                noteForm.reset();
                loadNotes(); // Recarrega a lista de notas
            } catch (error) {
                console.error('Erro ao adicionar nota:', error);
                showMessage('Erro ao adicionar nota.', true);
            }
        });
    }

    // Carrega as notas ao carregar a página (após todas as definições)
    loadNotes();
});
