document.addEventListener('DOMContentLoaded', () => {
    // A URL base da nossa API do FastAPI
    const API_URL = 'http://127.0.0.1:8000';

    // Elementos HTML
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageBox = document.getElementById('message-box');

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

    // Lógica para o formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginCode = document.getElementById('loginCode').value;
            const loginQuestion = document.getElementById('loginQuestion').value;
            const loginAnswer = document.getElementById('loginAnswer').value;

            try {
                // Endpoint imaginário de login. Assumimos que o backend possui este endpoint.
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: loginCode, question_id: loginQuestion, answer: loginAnswer })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('user_id', data.user_id);
                    window.location.href = 'lembretes.html';
                } else {
                    const errorData = await response.json();
                    showMessage(`Login não encontrado. Verifique seu código e respostas ou crie uma nova conta.`, true);
                }
            } catch (error) {
                console.error('Erro na conexão:', error);
                showMessage('Erro ao conectar com o servidor.', true);
            }
        });
    }

    // Lógica para o formulário de criação de conta
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const registerCode = document.getElementById('registerCode').value;
            const registerQuestion = document.getElementById('registerQuestion').value;
            const registerAnswer = document.getElementById('registerAnswer').value;

            try {
                // Endpoint imaginário de registro. Assumimos que o backend possui este endpoint.
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: registerCode, question_id: registerQuestion, answer: registerAnswer })
                });

                if (response.ok) {
                    showMessage('Conta criada com sucesso! Você pode usar seu código para entrar.', false);
                    registerForm.reset();
                } else {
                    const errorData = await response.json();
                    showMessage(`Erro ao criar conta: ${errorData.detail}.`, true);
                }
            } catch (error) {
                console.error('Erro na conexão:', error);
                showMessage('Erro ao conectar com o servidor.', true);
            }
        });
    }
});
