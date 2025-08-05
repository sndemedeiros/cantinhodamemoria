// medicamentos.js - Lógica específica para a página de medicamentos

// Importa as funções apiRequest e showMessage do arquivo api.js
import { apiRequest, showMessage } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-btn');
    const medicationForm = document.getElementById('medication-form'); // ID do formulário de medicamentos
    const medicationsList = document.getElementById('medications-list'); // ID da sua lista de medicamentos

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

    // Função para carregar e exibir medicamentos
    async function loadMedications() {
        if (!userId) return; // Garante que há um userId antes de tentar carregar

        try {
            // Exibe "Carregando medicamentos..." enquanto a requisição é feita
            medicationsList.innerHTML = '<p>Carregando medicamentos...</p>';

            // Usa a função apiRequest importada
            const medications = await apiRequest(`medicamentos/${userId}`);
            medicationsList.innerHTML = ''; // Limpa a mensagem de carregamento

            if (medications.length === 0) {
                medicationsList.innerHTML = '<p>Nenhum medicamento encontrado. Crie um novo!</p>';
            } else {
                medications.forEach(medication => {
                    const li = document.createElement('li');
                    li.className = 'medication-card'; // Mantém a classe para o seu CSS
                    li.innerHTML = `
                        <div class="item-info">
                            <p class="title">${medication.nome}</p>
                            <p>${medication.dosagem} às ${medication.horario}</p>
                        </div>
                        <button class="delete-btn" data-id="${medication.id}"><i class="fas fa-trash-alt"></i></button>
                    `;
                    medicationsList.appendChild(li);
                });

                // Adiciona event listeners para os botões de exclusão
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.onclick = async (event) => {
                        const medicationId = event.currentTarget.dataset.id; // Usar currentTarget
                        try {
                            await apiRequest(`medicamentos/${medicationId}`, 'DELETE');
                            showMessage('Medicamento excluído com sucesso!', false);
                            loadMedications(); // Recarrega a lista
                        } catch (error) {
                            console.error('Erro ao excluir medicamento:', error);
                            showMessage('Erro ao excluir medicamento.', true);
                        }
                    };
                });
            }
        } catch (error) {
            console.error('Erro ao carregar medicamentos:', error);
            showMessage('Erro ao carregar medicamentos.', true);
        }
    }

    // Lógica para adicionar novo medicamento
    if (medicationForm) {
        medicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('name-input').value;
            const dosagem = document.getElementById('dosage-input').value;
            const horario = document.getElementById('time-input').value;

            try {
                await apiRequest('medicamentos', 'POST', { user_id: userId, nome, dosagem, horario });
                showMessage('Medicamento adicionado com sucesso!', false);
                medicationForm.reset();
                loadMedications(); // Recarrega a lista de medicamentos
            } catch (error) {
                console.error('Erro ao adicionar medicamento:', error);
                showMessage('Erro ao adicionar medicamento.', true);
            }
        });
    }

    // Carrega os medicamentos ao carregar a página (após todas as definições)
    loadMedications();
});
