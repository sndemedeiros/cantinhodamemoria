💚 Cantinho da Memória 💚
Um aplicativo carinhoso e intuitivo, projetado para ajudar você a organizar seus pensamentos, lembretes e momentos especiais. Mantenha tudo o que importa ao seu alcance, desde tarefas diárias até as memórias mais queridas.

✨ Funcionalidades
O Cantinho da Memória oferece diversas ferramentas para a sua organização pessoal:

🔒 Login Seguro: Acesse sua conta com um código de acesso pessoal e uma pergunta de segurança personalizada, garantindo que suas informações estejam sempre protegidas.

🔔 Lembretes Inteligentes: Nunca mais se esqueça de um compromisso! Crie lembretes com datas, horários e opções de repetição (diária, semanal, mensal) para tudo o que você precisa lembrar.

🖼️ Memórias Preciosas: Guarde seus momentos inesquecíveis com fotos e descrições detalhadas. Reviva suas experiências favoritas a qualquer momento, com a possibilidade de adicionar até 5 imagens por memória.

🗓️ Rotinas Diárias: Organize seu dia com rotinas personalizadas, definindo tarefas e horários para manter sua vida em ordem.

💊 Controle de Medicamentos: Gerencie seus medicamentos com facilidade, registrando nomes, dosagens e horários para garantir que você nunca perca uma dose.

📝 Notas Rápidas: Anote ideias, pensamentos e informações importantes de forma prática, com títulos e conteúdos personalizáveis.

🚀 Tecnologias Utilizadas
Este projeto foi construído com uma arquitetura robusta e moderna:

Backend:

FastAPI: Um framework web Python rápido e de alta performance para a construção das APIs.

Firebase Firestore: Um banco de dados NoSQL flexível e escalável para armazenar todos os seus dados (usuários, lembretes, notas, memórias, rotinas, medicamentos).

Python: A linguagem de programação principal para o desenvolvimento do backend.

Frontend:

HTML5, CSS3, JavaScript (Puro): Para uma interface de usuário leve, responsiva e dinâmica.

Font Awesome: Para ícones modernos e elegantes.

Tailwind CSS (CDN): Utilizado para utilitários de estilo e responsividade, complementando o CSS personalizado.

Deploy:

Render: Plataforma de nuvem para o deploy contínuo e hospedagem tanto do backend (Web Service) quanto do frontend (Static Site).

💡 Como Usar
Acesse o Aplicativo: Visite a URL do seu frontend implantado (disponível no Render).

Crie sua Conta: Se for a primeira vez, clique em "Crie uma aqui" e defina um código de acesso de 4 dígitos e uma pergunta de segurança.

Faça Login: Use seu código de acesso e a resposta da sua pergunta de segurança para entrar.

Explore: Navegue pelas diferentes seções (Lembretes, Notas, Memórias, Rotinas, Medicamentos) e comece a organizar sua vida!

📂 Estrutura do Projeto
O projeto está organizado em duas pastas principais:

frontend/: Contém todo o código do lado do cliente (HTML, CSS, JavaScript).

backend/: Contém o código da API (FastAPI) e os arquivos de configuração do servidor.

⚙️ Instalação e Execução Local (Para Desenvolvedores)
Para configurar e executar o projeto na sua máquina local:

Pré-requisitos
Python 3.9+

pip (gerenciador de pacotes Python)

git

Uma conta no Firebase e um arquivo firebase-credentials.json configurado para o seu projeto.

Passos
Clone o Repositório:

git clone <URL_DO_SEU_REPOSITORIO>
cd cantinho_da_memoria


Configurar o Backend:

cd backend
pip install -r requirements.txt


Crie o arquivo de credenciais do Firebase: Coloque o seu arquivo firebase-credentials.json (baixado do Firebase Console) diretamente na pasta backend/.

Execute o Backend:

uvicorn main:app --reload


O backend estará acessível em http://127.0.0.1:8000.

Configurar o Frontend:

cd ../frontend


Abra o arquivo api.js e certifique-se de que a API_URL está configurada para o ambiente local:

const API_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'https://cantinho-da-memoria-backend.onrender.com'; // Sua URL do Render


Abra o index.html no seu navegador: Simplesmente abra o arquivo frontend/index.html diretamente no seu navegador web.

☁️ Deploy
O deploy deste projeto é feito na plataforma Render:

Frontend: Hospedado como um Static Site no Render.

Backend: Hospedado como um Web Service no Render.

Variável de Ambiente Crucial: Certifique-se de configurar a variável de ambiente FIREBASE_CREDENTIALS_JSON no Render para o seu serviço de backend, contendo o conteúdo completo do seu arquivo firebase-credentials.json.
