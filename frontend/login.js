document.addEventListener('DOMContentLoaded', () => {
    // ==============================================================================
    // Conexão com o Backend (API)
    // ==============================================================================
    // A URL real do seu serviço backend no Render.
    const BASE_URL = 'https://cantinho-da-memoria-backend.onrender.com';

    // Função auxiliar para fazer requisições à API
    async function apiRequest(endpoint, method = 'GET', data = null) {
        const url = `${BASE_URL}/${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erro na requisição da API');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição da API:', error);
            throw error;
        }
    }

    // ==============================================================================
    // Elementos HTML e Funções de Feedback
    // ==============================================================================
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

    // ==============================================================================
    // Lógica para os Formulários de Autenticação
    // ==============================================================================

    // Lógica para o formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginCode = document.getElementById('loginCode').value;
            const loginQuestion = document.getElementById('loginQuestion').value;
            const loginAnswer = document.getElementById('loginAnswer').value;

            try {
                // Usando a função apiRequest para login
                const response = await apiRequest('login', 'POST', { code: loginCode, question_id: loginQuestion, answer: loginAnswer });

                if (response) { // apiRequest já trata erros, então se chegou aqui, foi sucesso
                    localStorage.setItem('user_id', response.user_id);
                    window.location.href = 'lembretes.html'; // Redireciona após login bem-sucedido
                }
            } catch (error) {
                console.error('Erro na conexão ou login:', error);
                showMessage('Erro ao conectar com o servidor ou credenciais inválidas.', true);
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
                // Usando a função apiRequest para registro
                const response = await apiRequest('register', 'POST', { code: registerCode, question_id: registerQuestion, answer: registerAnswer });

                if (response) { // apiRequest já trata erros, então se chegou aqui, foi sucesso
                    showMessage('Conta criada com sucesso! Você pode usar seu código para entrar.', false);
                    registerForm.reset(); // Limpa o formulário após o registro
                }
            } catch (error) {
                console.error('Erro na conexão ou registro:', error);
                showMessage(`Erro ao criar conta: ${error.message}.`, true);
            }
        });
    }

    // ==============================================================================
    // Lógica para a Página de Lembretes (Exemplo)
    // ==============================================================================
    // Você precisará adicionar lógica semelhante para outras páginas (medicamentos, rotinas, memórias, notas)
    // e para as interações de CRUD (criar, ler, atualizar, deletar) com o backend.

    const lembretesList = document.getElementById('lembretesList');
    const lembreteForm = document.getElementById('lembreteForm');
    const userId = localStorage.getItem('user_id'); // Obtém o user_id do localStorage

    if (lembretesList && userId) {
        // Função para carregar e exibir lembretes
        async function loadLembretes() {
            try {
                const lembretes = await apiRequest(`lembretes/${userId}`);
                lembretesList.innerHTML = ''; // Limpa a lista existente
                if (lembretes.length === 0) {
                    lembretesList.innerHTML = '<p>Nenhum lembrete encontrado. Crie um novo!</p>';
                } else {
                    lembretes.forEach(lembrete => {
                        const li = document.createElement('li');
                        li.textContent = `${lembrete.tarefa} - ${lembrete.data} às ${lembrete.hora} (${lembrete.repeticao})`;

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Excluir';
                        deleteBtn.className = 'delete-btn';
                        deleteBtn.onclick = async () => {
                            try {
                                await apiRequest(`lembretes/${lembrete.id}`, 'DELETE');
                                showMessage('Lembrete excluído com sucesso!', false);
                                loadLembretes(); // Recarrega a lista
                            } catch (error) {
                                console.error('Erro ao excluir lembrete:', error);
                                showMessage('Erro ao excluir lembrete.', true);
                            }
                        };
                        li.appendChild(deleteBtn);
                        lembretesList.appendChild(li);
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar lembretes:', error);
                showMessage('Erro ao carregar lembretes.', true);
            }
        }

        loadLembretes(); // Carrega os lembretes ao carregar a página

        // Lógica para adicionar novo lembrete
        if (lembreteForm) {
            lembreteForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const tarefa = document.getElementById('tarefa').value;
                const data = document.getElementById('data').value;
                const hora = document.getElementById('hora').value;
                const repeticao = document.getElementById('repeticao').value;

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
    } else if (lembretesList && !userId) {
        // Se estiver na página de lembretes mas não houver user_id no localStorage
        lembretesList.innerHTML = '<p>Você precisa fazer login para ver seus lembretes.</p>';
        // Opcional: redirecionar para a página de login
        // window.location.href = 'index.html';
    }

    // ==============================================================================
    // Lógica para Logout
    // ==============================================================================
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('user_id'); // Remove o user_id do localStorage
            window.location.href = 'index.html'; // Redireciona para a página de login
        });
    }

    // ==============================================================================
    // Lógica para Navegação (Exemplo)
    // ==============================================================================
    // Adicione event listeners para os links de navegação se você tiver um menu
    // Exemplo:
    // document.getElementById('linkLembretes').addEventListener('click', () => {
    //     window.location.href = 'lembretes.html';
    // });
    // document.getElementById('linkMedicamentos').addEventListener('click', () => {
    //     window.location.href = 'medicamentos.html';
    // });
    // ... e assim por diante
});
