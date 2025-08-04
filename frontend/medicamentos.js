document.addEventListener('DOMContentLoaded', () => {
    // A URL base da nossa API do FastAPI
    const API_URL = 'http://127.0.0.1:8000';

    // Obter o ID do usuário do localStorage
    const currentUserId = localStorage.getItem('user_id');

    // Elementos HTML
    const form = document.getElementById('medication-form');
    const nameInput = document.getElementById('name-input');
    const dosageInput = document.getElementById('dosage-input');
    const timeInput = document.getElementById('time-input');
    const medicationsList = document.getElementById('medications-list');
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

    // Função para buscar e exibir os medicamentos da API
    async function fetchAndDisplayMedications() {
        try {
            const response = await fetch(`${API_URL}/medicamentos/${currentUserId}`);
            const medications = await response.json();

            medicationsList.innerHTML = ''; // Limpa a lista antes de adicionar
            if (medications.length === 0) {
                medicationsList.innerHTML = '<p>Nenhum medicamento cadastrado.</p>';
            } else {
                medications.forEach(medication => {
                    const medicationCard = document.createElement('li');
                    medicationCard.className = 'medication-card';
                    medicationCard.innerHTML = `
                        <div class="medication-info">
                            <p class="title">${medication.nome}</p>
                            <p>${medication.dosagem} às ${medication.horario}</p>
                        </div>
                        <button class="delete-btn" data-id="${medication.id}">❌</button>
                    `;
                    medicationsList.appendChild(medicationCard);
                });
                // Adicionar event listeners aos botões de deletar
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', deleteMedication);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar medicamentos:', error);
            showMessage('Erro ao carregar medicamentos.', true);
        }
    }

    // Função para adicionar um novo medicamento
    async function createMedication(event) {
        event.preventDefault();

        const nome = nameInput.value;
        const dosagem = dosageInput.value;
        const horario = timeInput.value;

        const medicationData = {
            user_id: currentUserId,
            nome: nome,
            dosagem: dosagem,
            horario: horario
        };

        try {
            const response = await fetch(`${API_URL}/medicamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationData)
            });

            if (response.ok) {
                showMessage('Medicamento adicionado com sucesso!');
                form.reset();
                fetchAndDisplayMedications();
            } else {
                showMessage('Erro ao adicionar medicamento.', true);
            }
        } catch (error) {
            console.error('Erro ao adicionar medicamento:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Função para deletar um medicamento
    async function deleteMedication(event) {
        const medicationId = event.target.dataset.id;
        try {
            const response = await fetch(`${API_URL}/medicamentos/${medicationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('Medicamento excluído com sucesso!');
                fetchAndDisplayMedications();
            } else {
                showMessage('Erro ao excluir medicamento.', true);
            }
        } catch (error) {
            console.error('Erro ao excluir medicamento:', error);
            showMessage('Erro ao conectar com a API.', true);
        }
    }

    // Event Listeners
    if (form) {
        form.addEventListener('submit', createMedication);
    }

    // Inicializar a lista de medicamentos quando a página carrega
    window.addEventListener('load', () => {
        fetchAndDisplayMedications();
    });
});
