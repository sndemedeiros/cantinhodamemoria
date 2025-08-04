document.addEventListener('DOMContentLoaded', () => {
    // A URL base da nossa API do FastAPI
    const API_URL = 'http://127.0.0.1:8000';

    // Obter o ID do usuário do localStorage
    const currentUserId = localStorage.getItem('user_id');

    // Elementos HTML
    const form = document.getElementById('routine-form');
    const taskInput = document.getElementById('task-input');
    const repetitionSelect = document.getElementById('repetition-select');
    const timeInput = document.getElementById('time-input');
    const routinesList = document.getElementById('routines-list');
    const messageBox = document.getElementById('message-box');

    // Verificar se o usuário está logado, caso contrário, redireciona
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

    // Função para buscar e exibir as rotinas da API
    async function fetchAndDisplayRoutines() {
        try {
            const response = await fetch(`${API_URL}/rotinas/${currentUserId}`);
            const routines = await response.json();

            routinesList.innerHTML = ''; // Limpa a lista antes de adicionar
            if (routines.length === 0) {
                routinesList.innerHTML = '<p>Nenhuma rotina cadastrada.</p>';
            } else {
                routines.forEach(routine => {
                    const routineCard = document.createElement('li');
                    routineCard.className = 'routine-card';
                    routineCard.innerHTML = `
                        <div class="routine-info">
                            <span class="task">${routine.tarefa}</span>
                            <span class="time">${routine.horario}</span>
                            <span class="repetition">(${routine.repeticao})</span>
                        </div>
                        <button class="delete-btn" data-id="${routine.id}">❌</button>
                    `;
                    routinesList.appendChild(routineCard);
                });
                // Adicionar event listeners aos botões de deletar
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', deleteRoutine);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar rotinas:', error);
            showMessage('Erro ao carregar rotinas.', true);
        }
    }

    // Função para adicionar uma nova rotina
    async function createRoutine(event) {
        event.preventDefault();

        const tarefa = taskInput.value;
        const repeticao = repetitionSelect.value;
        const horario = timeInput.value;

        const routineData = {
            user_id: currentUserId,
            tarefa: tarefa,
            repeticao: repeticao,
            horario: horario
        };

        try {
            const response = await fetch(`${API_URL}/rotinas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(routineData)
            });

            if (response.ok) {
                showMessage('Rotina adicionada com sucesso!');
                form.reset();
                fetchAndDisplayRoutines();
            } else {
                showMessage('Erro ao adicionar rotina.', true);
            }
        } catch (error) {
            console.error('Erro ao adicionar rotina:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Função para deletar uma rotina
    async function deleteRoutine(event) {
        const routineId = event.target.dataset.id;
        try {
            const response = await fetch(`${API_URL}/rotinas/${routineId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('Rotina excluída com sucesso!');
                fetchAndDisplayRoutines();
            } else {
                showMessage('Erro ao excluir rotina.', true);
            }
        } catch (error) {
            console.error('Erro ao excluir rotina:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Event Listeners
    if (form) {
        form.addEventListener('submit', createRoutine);
    }

    // Inicializar a lista de rotinas quando a página carrega
    window.addEventListener('load', () => {
        fetchAndDisplayRoutines();
    });
});
