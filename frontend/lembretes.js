// lembretes.js - Lógica específica para a página de lembretes

// Importa as funções apiRequest, showMessage e formatDateForDisplay do arquivo api.js
import { apiRequest, showMessage, formatDateForDisplay } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-btn');
    const lembreteForm = document.getElementById('lembrete-form'); // ID do formulário de lembretes
    const lembretesList = document.getElementById('lembretes-list'); // ID da sua lista de lembretes

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

    // Função para carregar e exibir lembretes
    async function loadLembretes() {
        if (!userId) return; // Garante que há um userId antes de tentar carregar

        try {
            // Exibe "Carregando lembretes..." enquanto a requisição é feita
            lembretesList.innerHTML = '<p>Carregando lembretes...</p>';

            // Usa a função apiRequest importada
            const lembretes = await apiRequest(`lembretes/${userId}`);
            lembretesList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (lembretes.length === 0) {
                lembretesList.innerHTML = '<p>Nenhum lembrete encontrado. Crie um novo!</p>';
            } else {
                lembretes.forEach(lembrete => {
                    const li = document.createElement('li');
                    li.className = 'lembrete-card'; // Mantém a classe para o seu CSS

                    // Formata a data antes de exibir
                    const formattedDate = formatDateForDisplay(lembrete.data);

                    li.innerHTML = `
                        <div class="item-info">
                            <h3 class="title">${lembrete.tarefa}</h3>
                            <p>Data: ${formattedDate} - Hora: ${lembrete.hora}</p>
                            <p>Repetição: ${lembrete.repeticao}</p>
                        </div>
                        <button class="delete-btn" data-id="${lembrete.id}"><i class="fas fa-trash-alt"></i></button>
                    `;
                    lembretesList.appendChild(li);
                });

                // Adiciona event listeners para os botões de exclusão
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.onclick = async (event) => {
                        const lembreteId = event.currentTarget.dataset.id; // Usar currentTarget
                        try {
                            await apiRequest(`lembretes/${lembreteId}`, 'DELETE');
                            showMessage('Lembrete excluído com sucesso!', false);
                            loadLembretes(); // Recarrega a lista
                        } catch (error) {
                            console.error('Erro ao excluir lembrete:', error);
                            showMessage('Erro ao excluir lembrete.', true);
                        }
                    };
                });
            }
        } catch (error) {
            console.error('Erro ao carregar lembretes:', error);
            showMessage('Erro ao carregar lembretes.', true);
        }
    }

    // Lógica para adicionar novo lembrete
    if (lembreteForm) {
        lembreteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tarefa = document.getElementById('tarefa-input').value;
            const data = document.getElementById('data-input').value;
            const hora = document.getElementById('hora-input').value;
            const repeticao = document.getElementById('repeticao-input').value;

            try {
                await apiRequest('lembretes', 'POST', { user_id: userId, tarefa, data, hora, repeticao });
                showMessage('Lembrete adicionado com sucesso!', false);
                lembreteForm.reset();
                loadLembretes(); // Recarrega a lista de lembretes
            } catch (error) {
                console.error('Erro ao adicionar lembrete:', error);
                showMessage('Erro ao adicionar lembrete.', true);
            }
        });
    }

    // Carrega os lembretes ao carregar a página (após todas as definições)
    loadLembretes();
});
