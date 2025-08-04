import os
import uuid
import base64
import firebase_admin
from typing import Optional, List
from datetime import date
from pydantic import BaseModel, ValidationError
from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client

# ==============================================================================
# Configuração do Firebase
# ==============================================================================
# Tenta inicializar o app do Firebase se ainda não foi inicializado
cred_path = "firebase-credentials.json"
if os.path.exists(cred_path):
    try:
        # A forma correta de verificar se o app já foi inicializado
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        print("✅ Firebase inicializado com sucesso!")
        db = firestore.client()
    except Exception as e:
        print(f"❌ Erro ao inicializar o Firebase: {e}")
        db: Optional[Client] = None
else:
    print(f"❌ Arquivo de credenciais não encontrado: {cred_path}")
    db: Optional[Client] = None

# ==============================================================================
# Configuração do FastAPI
# ==============================================================================
app = FastAPI()

# Configuração do CORS para permitir que o front-end se comunique com a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os headers
)

# ==============================================================================
# Modelos de Dados (Pydantic)
# ==============================================================================
class User(BaseModel):
    code: str
    question_id: str
    answer: str

class LoginData(BaseModel):
    code: str
    question_id: str
    answer: str

class Lembrete(BaseModel):
    user_id: str
    tarefa: str
    data: str
    hora: str
    repeticao: str

class Medicamento(BaseModel):
    user_id: str
    nome: str
    horario: str
    dosagem: str

class Rotina(BaseModel):
    user_id: str
    tarefa: str
    repeticao: str
    horario: str

class Memoria(BaseModel):
    user_id: str
    titulo: str
    data: str
    descricao: str
    imagem_url: Optional[str] = None

class Nota(BaseModel):
    user_id: str
    titulo: str
    conteudo: str

# ==============================================================================
# Endpoints de Autenticação
# ==============================================================================

@app.post("/register")
async def register_user(user: User):
    """Cria um novo usuário com um código de acesso e uma pergunta de segurança."""
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")

    # Verifica se o código de 4 dígitos já existe
    doc_ref = db.collection("users").document(user.code)
    doc = doc_ref.get()
    if doc.exists:
        raise HTTPException(status_code=400, detail="Código de acesso já em uso. Escolha outro.")

    # Salva o novo usuário no Firestore
    try:
        db.collection("users").document(user.code).set(user.dict())
        return {"message": "Conta criada com sucesso!", "user_id": user.code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao criar conta: {e}")

@app.post("/login")
async def login(data: LoginData):
    """Autentica o usuário com o código de acesso e a resposta da pergunta de segurança."""
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    
    doc_ref = db.collection("users").document(data.code)
    doc = doc_ref.get()

    if doc.exists:
        user_data = doc.to_dict()
        # Obtém os valores com .get() para evitar KeyError se a conta for antiga
        db_question_id = user_data.get("question_id")
        db_answer = user_data.get("answer")

        # Se os campos existirem e corresponderem, o login é bem-sucedido
        if db_question_id is not None and db_answer is not None and \
           db_question_id == data.question_id and db_answer.lower() == data.answer.lower():
            return {"message": "Login bem-sucedido", "user_id": data.code}
        else:
            raise HTTPException(status_code=401, detail="Credenciais inválidas. Verifique seu código, pergunta e resposta.")
    else:
        raise HTTPException(status_code=404, detail="Usuário não encontrado. Verifique seu código ou crie uma nova conta.")

# ------------------------------------------------------------------------------
# Endpoints de Lembretes
# ------------------------------------------------------------------------------
@app.post("/lembretes")
async def create_lembrete(lembrete: Lembrete):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        lembrete_id = str(uuid.uuid4())
        db.collection("lembretes").document(lembrete_id).set(lembrete.dict())
        return {"id": lembrete_id, **lembrete.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao salvar lembrete: {e}")

@app.get("/lembretes/{user_id}")
async def get_lembretes(user_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        docs = db.collection("lembretes").where("user_id", "==", user_id).stream()
        lembretes = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return lembretes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao buscar lembretes: {e}")

@app.delete("/lembretes/{lembrete_id}")
async def delete_lembrete(lembrete_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    db.collection("lembretes").document(lembrete_id).delete()
    return {"message": "Lembrete excluído com sucesso"}

# ------------------------------------------------------------------------------
# Endpoints de Medicamentos
# ------------------------------------------------------------------------------
@app.post("/medicamentos")
async def create_medicamento(medicamento: Medicamento):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        medicamento_id = str(uuid.uuid4())
        db.collection("medicamentos").document(medicamento_id).set(medicamento.dict())
        return {"id": medicamento_id, **medicamento.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao salvar medicamento: {e}")

@app.get("/medicamentos/{user_id}")
async def get_medicamentos(user_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        docs = db.collection("medicamentos").where("user_id", "==", user_id).stream()
        medicamentos = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return medicamentos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao buscar medicamentos: {e}")

@app.delete("/medicamentos/{medicamento_id}")
async def delete_medicamento(medicamento_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    db.collection("medicamentos").document(medicamento_id).delete()
    return {"message": "Medicamento excluído com sucesso"}

# ------------------------------------------------------------------------------
# Endpoints de Rotinas
# ------------------------------------------------------------------------------
@app.post("/rotinas")
async def create_rotina(rotina: Rotina):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        rotina_id = str(uuid.uuid4())
        db.collection("rotinas").document(rotina_id).set(rotina.dict())
        return {"id": rotina_id, **rotina.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao salvar rotina: {e}")

@app.get("/rotinas/{user_id}")
async def get_rotinas(user_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        docs = db.collection("rotinas").where("user_id", "==", user_id).stream()
        rotinas = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return rotinas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao buscar rotinas: {e}")

@app.delete("/rotinas/{rotina_id}")
async def delete_rotina(rotina_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    db.collection("rotinas").document(rotina_id).delete()
    return {"message": "Rotina excluída com sucesso"}

# ------------------------------------------------------------------------------
# Endpoints de Memórias
# ------------------------------------------------------------------------------
@app.post("/memorias")
async def create_memoria(
    user_id: str = Form(...),
    titulo: str = Form(...),
    data: str = Form(...),
    descricao: str = Form(...),
    imagem: Optional[UploadFile] = File(None)
):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        memoria_id = str(uuid.uuid4())
        memoria_data = {
            "user_id": user_id,
            "titulo": titulo,
            "data": data,
            "descricao": descricao,
            "imagem_url": None,
        }
        
        if imagem and imagem.filename:
            file_content = await imagem.read()
            file_base64 = base64.b64encode(file_content).decode('utf-8')
            memoria_data["imagem_url"] = f"data:{imagem.content_type};base64,{file_base64}"
            
        db.collection("memorias").document(memoria_id).set(memoria_data)
        return {"id": memoria_id, **memoria_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao salvar memória: {e}")

@app.get("/memorias/{user_id}")
async def get_memorias(user_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        docs = db.collection("memorias").where("user_id", "==", user_id).stream()
        memorias = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return memorias
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao buscar memórias: {e}")

@app.delete("/memorias/{memoria_id}")
async def delete_memoria(memoria_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    db.collection("memorias").document(memoria_id).delete()
    return {"message": "Memória excluída com sucesso"}

# ------------------------------------------------------------------------------
# Endpoints de Notas
# ------------------------------------------------------------------------------
@app.post("/notas")
async def create_nota(nota: Nota):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        nota_id = str(uuid.uuid4())
        db.collection("notas").document(nota_id).set(nota.dict())
        return {"id": nota_id, **nota.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao salvar nota: {e}")

@app.get("/notas/{user_id}")
async def get_notas(user_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    try:
        docs = db.collection("notas").where("user_id", "==", user_id).stream()
        notas = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return notas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao buscar notas: {e}")

@app.delete("/notas/{nota_id}")
async def delete_nota(nota_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Serviço de banco de dados não disponível")
    db.collection("notas").document(nota_id).delete()
    return {"message": "Nota excluída com sucesso"}
