// login.js - Lógica específica para a página de login/registro

// Importa as funções apiRequest e showMessage do arquivo api.js
import { apiRequest, showMessage } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // ==============================================================================
    // Elementos HTML e Funções de Feedback (showMessage agora vem de api.js)
    // ==============================================================================
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleToRegisterLink = document.getElementById('toggle-to-register');
    const toggleToLoginLink = document.getElementById('toggle-to-login');
    const loginSection = document.getElementById('login-form-section');
    const registerSection = document.getElementById('register-form-section');
    // messageBox não precisa ser definida aqui, pois showMessage a encontra globalmente ou é passada como argumento

    // NOVOS ELEMENTOS: Para a política de privacidade
    const privacyLink = document.getElementById('privacy-link');
    const privacyModal = document.getElementById('privacy-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Alterna entre os formulários de login e registro
    function toggleForms() {
        if (loginSection.classList.contains('active')) {
            loginSection.classList.remove('active');
            loginSection.classList.add('hidden');
            registerSection.classList.remove('hidden');
            registerSection.classList.add('active');
        } else {
            registerSection.classList.remove('active');
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden'); // Certifica-se de que não está hidden
            loginSection.classList.add('active');
        }
    }

    // ==============================================================================
    // Event Listeners para Formulários e Navegação
    // ==============================================================================

    if (toggleToRegisterLink) {
        toggleToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms();
        });
    }

    if (toggleToLoginLink) {
        toggleToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const code = document.getElementById('register-code').value;
            const question_id = document.getElementById('register-question-id').value;
            const answer = document.getElementById('register-answer').value;

            try {
                const response = await apiRequest('register', 'POST', { code, question_id, answer });
                showMessage(response.message, false);
                registerForm.reset(); // Esta linha limpa o formulário
                toggleForms(); // Volta para o login após o registro bem-sucedido
            } catch (error) {
                // showMessage já foi chamado dentro de apiRequest
                console.error('Erro ao registrar no formulário:', error);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const code = document.getElementById('login-code').value;
            const question_id = document.getElementById('login-question-id').value;
            const answer = document.getElementById('login-answer').value;

            try {
                const response = await apiRequest('login', 'POST', { code, question_id, answer });
                showMessage(response.message, false);
                localStorage.setItem('user_id', response.user_id);
                window.location.href = 'lembretes.html';
            } catch (error) {
                // showMessage já foi chamado dentro de apiRequest
                console.error('Erro ao fazer login no formulário:', error);
            }
        });
    }

    // Lógica para mostrar e esconder o modal de privacidade
    if (privacyLink) {
        privacyLink.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o link de navegar
            if (privacyModal) {
                privacyModal.classList.remove('hidden'); // Remove a classe hidden para mostrar o modal
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (privacyModal) {
                privacyModal.classList.add('hidden'); // Adiciona a classe hidden para esconder o modal
            }
        });
    }

    if (privacyModal) {
        privacyModal.addEventListener('click', (event) => {
            // Esconde o modal apenas se clicar fora do conteúdo do modal
            if (event.target === privacyModal) {
                privacyModal.classList.add('hidden'); // Adiciona a classe hidden para esconder o modal
            }
        });
    }
});
