// rotinas.js - Lógica específica para a página de rotinas

// Importa as funções apiRequest e showMessage do arquivo api.js
import { apiRequest, showMessage } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-btn');
    const routineForm = document.getElementById('routine-form'); // ID do formulário de rotinas
    const routinesList = document.getElementById('routines-list'); // ID da sua lista de rotinas

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

    // Função para carregar e exibir rotinas
    async function loadRoutines() {
        if (!userId) return; // Garante que há um userId antes de tentar carregar

        try {
            // Exibe "Carregando rotinas..." enquanto a requisição é feita
            routinesList.innerHTML = '<p>Carregando rotinas...</p>';

            // Usa a função apiRequest importada
            const routines = await apiRequest(`rotinas/${userId}`);
            routinesList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (routines.length === 0) {
                routinesList.innerHTML = '<p>Nenhuma rotina encontrada. Crie uma nova!</p>';
            } else {
                routines.forEach(routine => {
                    const li = document.createElement('li');
                    li.className = 'routine-card'; // Mantém a classe para o seu CSS
                    li.innerHTML = `
                        <div class="item-info">
                            <span class="task">${routine.tarefa}</span>
                            <span class="time">${routine.horario}</span>
                            <span class="repetition">(${routine.repeticao})</span>
                        </div>
                        <button class="delete-btn" data-id="${routine.id}"><i class="fas fa-trash-alt"></i></button>
                    `;
                    routinesList.appendChild(li);
                });

                // Adiciona event listeners para os botões de exclusão
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.onclick = async (event) => {
                        const routineId = event.currentTarget.dataset.id; // Usar currentTarget
                        try {
                            await apiRequest(`rotinas/${routineId}`, 'DELETE');
                            showMessage('Rotina excluída com sucesso!', false);
                            loadRoutines(); // Recarrega a lista
                        } catch (error) {
                            console.error('Erro ao excluir rotina:', error);
                            showMessage('Erro ao excluir rotina.', true);
                        }
                    };
                });
            }
        } catch (error) {
            console.error('Erro ao carregar rotinas:', error);
            showMessage('Erro ao carregar rotinas.', true);
        }
    }

    // Lógica para adicionar nova rotina
    if (routineForm) {
        routineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tarefa = document.getElementById('task-input').value;
            const repeticao = document.getElementById('repetition-select').value;
            const horario = document.getElementById('time-input').value;

            try {
                await apiRequest('rotinas', 'POST', { user_id: userId, tarefa, repeticao, horario });
                showMessage('Rotina adicionada com sucesso!', false);
                routineForm.reset();
                loadRoutines(); // Recarrega a lista de rotinas
            } catch (error) {
                console.error('Erro ao adicionar rotina:', error);
                showMessage('Erro ao adicionar rotina.', true);
            }
        });
    }

    // Carrega as rotinas ao carregar a página (após todas as definições)
    loadRoutines();
});
