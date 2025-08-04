document.addEventListener('DOMContentLoaded', () => {
    // A URL base da nossa API do FastAPI
    const API_URL = 'http://127.0.0.1:8000';

    // Obter o ID do usuário do localStorage
    const currentUserId = localStorage.getItem('user_id');

    // Elementos HTML
    const form = document.getElementById('reminder-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const repetitionInput = document.getElementById('repetition-input');
    const remindersList = document.getElementById('reminders-list');
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

    // Função para buscar e exibir os lembretes da API
    async function fetchAndDisplayReminders() {
        try {
            const response = await fetch(`${API_URL}/lembretes/${currentUserId}`);
            const reminders = await response.json();

            remindersList.innerHTML = ''; // Limpa a lista antes de adicionar
            if (reminders.length === 0) {
                remindersList.innerHTML = '<p>Nenhum lembrete cadastrado.</p>';
            } else {
                reminders.forEach(reminder => {
                    const reminderCard = document.createElement('li');
                    reminderCard.className = 'reminder-card';
                    reminderCard.innerHTML = `
                        <div class="reminder-info">
                            <p class="title">${reminder.tarefa}</p>
                            <p>${reminder.data} às ${reminder.hora} (${reminder.repeticao})</p>
                        </div>
                        <button class="delete-btn" data-id="${reminder.id}">❌</button>
                    `;
                    remindersList.appendChild(reminderCard);
                });
                // Adicionar event listeners aos botões de deletar
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', deleteReminder);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar lembretes:', error);
            showMessage('Erro ao carregar lembretes.', true);
        }
    }

    // Função para adicionar um novo lembrete
    async function createReminder(event) {
        event.preventDefault();

        const task = taskInput.value;
        const date = dateInput.value;
        const time = timeInput.value;
        const repetition = repetitionInput.value;

        const reminderData = {
            user_id: currentUserId,
            tarefa: task,
            data: date,
            hora: time,
            repeticao: repetition
        };

        try {
            const response = await fetch(`${API_URL}/lembretes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reminderData)
            });

            if (response.ok) {
                showMessage('Lembrete adicionado com sucesso!');
                form.reset();
                fetchAndDisplayReminders();
            } else {
                showMessage('Erro ao adicionar lembrete.', true);
            }
        } catch (error) {
            console.error('Erro ao adicionar lembrete:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Função para deletar um lembrete
    async function deleteReminder(event) {
        const reminderId = event.target.dataset.id;
        try {
            const response = await fetch(`${API_URL}/lembretes/${reminderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('Lembrete excluído com sucesso!');
                fetchAndDisplayReminders();
            } else {
                showMessage('Erro ao excluir lembrete.', true);
            }
        } catch (error) {
            console.error('Erro ao excluir lembrete:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Event Listeners
    if (form) {
        form.addEventListener('submit', createReminder);
    }

    // Inicializar a lista de lembretes quando a página carrega
    window.addEventListener('load', () => {
        fetchAndDisplayReminders();
    });
});
