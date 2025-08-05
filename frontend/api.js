// api.js - Funções de API Compartilhadas

// Define a URL base da API, adaptando-se entre ambiente local e de produção no Render.
const API_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'https://cantinho-da-memoria-backend.onrender.com';

/**
 * Função auxiliar para fazer requisições à API com retentativas.
 * @param {string} endpoint - O endpoint da API (ex: 'login', 'lembretes/123').
 * @param {string} method - O método HTTP (GET, POST, PUT, DELETE).
 * @param {object} data - Os dados a serem enviados no corpo da requisição (para POST/PUT).
 * @returns {Promise<object>} - Uma promessa que resolve com a resposta JSON da API.
 * @throws {Error} - Lança um erro se a requisição falhar após as retentativas.
 */
export async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_URL}/${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const MAX_RETRIES = 3;
    let currentDelay = 1000; // 1 segundo

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                // Se for um erro do cliente (4xx) ou a última retentativa, lança imediatamente
                if ((response.status >= 400 && response.status < 500) || i === MAX_RETRIES - 1) {
                    throw new Error(errorData.detail || `Erro desconhecido na requisição da API (Status: ${response.status})`);
                } else {
                    // Para erros de servidor (5xx) ou problemas de rede transitórios, registra e tenta novamente
                    console.warn(`Tentativa ${i + 1} falhou para ${endpoint} (Status: ${response.status}). Retentando em ${currentDelay / 1000}s...`);
                    await new Promise(res => setTimeout(res, currentDelay));
                    currentDelay *= 2; // Atraso exponencial
                    continue; // Vai para a próxima iteração do loop
                }
            }
            return await response.json(); // Sucesso, sai do loop e retorna
        } catch (error) {
            // Registra o erro para depuração
            console.error(`Erro na requisição da API para ${endpoint} (tentativa ${i + 1}):`, error);

            // Se for a última retentativa, ou um erro não relacionado à rede, lança o erro
            if (i === MAX_RETRIES - 1 || !(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
                throw error; // O erro será capturado pela função que chamou (ex: loadLembretes)
            } else {
                // Para erros de rede em retentativas que não sÃ£o a última, apenas espera e tenta novamente
                console.warn(`Tentativa ${i + 1} falhou para ${endpoint} (Erro de rede). Retentando em ${currentDelay / 1000}s...`);
                await new Promise(res => setTimeout(res, currentDelay));
                currentDelay *= 2; // Atraso exponencial
            }
        }
    }
    // Esta linha não deve ser alcançada se o número máximo de retentativas for excedido e um erro for lançado
    throw new Error("Número máximo de retentativas excedido para a requisição.");
}

/**
 * Exibe uma mensagem de feedback na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} isError - Indica se é uma mensagem de erro.
 */
export function showMessage(message, isError = false) {
    const messageBox = document.getElementById('message-box');
    if (messageBox) { // Garante que a messageBox existe na página
        messageBox.textContent = message;
        messageBox.className = isError ? 'message-box error' : 'message-box success';
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    } else {
        console.warn('Elemento #message-box não encontrado. Mensagem:', message);
    }
}
