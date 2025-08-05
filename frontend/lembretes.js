// lembretes.js - Lógica específica para a página de lembretes

// Importa as funções apiRequest e showMessage do arquivo api.js
import { apiRequest, showMessage } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-btn');
    const reminderForm = document.getElementById('reminder-form');
    const remindersList = document.getElementById('reminders-list'); // ID da sua lista de lembretes

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
    async function loadReminders() {
        if (!userId) return; // Garante que há um userId antes de tentar carregar

        try {
            // Exibe "Carregando lembretes..." enquanto a requisição é feita
            remindersList.innerHTML = '<p>Carregando lembretes...</p>';

            // Usa a função apiRequest importada
            const lembretes = await apiRequest(`lembretes/${userId}`);
            remindersList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (lembretes.length === 0) {
                remindersList.innerHTML = '<p>Nenhum lembrete encontrado. Crie um novo!</p>';
            } else {
                lembretes.forEach(lembrete => {
                    const li = document.createElement('li');
                    // O seu style.css já estiliza 'item-list li', então não precisamos de className aqui.
                    // A classe 'item-info' e 'delete-btn' já estão no seu CSS.
                    li.innerHTML = `
                        <div class="item-info">
                            <p class="title">${lembrete.tarefa}</p>
                            <p>${lembrete.data} às ${lembrete.hora} (${lembrete.repeticao})</p>
                        </div>
                        <button class="delete-btn" data-id="${lembrete.id}"><i class="fas fa-trash-alt"></i></button>
                    `;
                    remindersList.appendChild(li);
                });

                // Adiciona event listeners para os botões de exclusão
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.onclick = async (event) => {
                        const lembreteId = event.currentTarget.dataset.id; // Usar currentTarget para garantir que o elemento correto é referenciado
                        try {
                            await apiRequest(`lembretes/${lembreteId}`, 'DELETE');
                            showMessage('Lembrete excluído com sucesso!', false);
                            loadReminders(); // Recarrega a lista
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
    if (reminderForm) {
        reminderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tarefa = document.getElementById('task-input').value; // ID do seu input de tarefa
            const data = document.getElementById('date-input').value;   // ID do seu input de data
            const hora = document.getElementById('time-input').value;   // ID do seu input de hora
            const repeticao = document.getElementById('repetition-input').value; // ID do seu input de repetição

            try {
                await apiRequest('lembretes', 'POST', { user_id: userId, tarefa, data, hora, repeticao });
                showMessage('Lembrete adicionado com sucesso!', false);
                reminderForm.reset();
                loadReminders(); // Recarrega a lista de lembretes
            } catch (error) {
                console.error('Erro ao adicionar lembrete:', error);
                showMessage('Erro ao adicionar lembrete.', true);
            }
        });
    }

    // Carrega os lembretes ao carregar a página (após todas as definições)
    loadReminders();
});
