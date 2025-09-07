# 🚀 Deploy no Vercel com Supabase
## Sistema de Gestão para Barbearia MV 2025

### 📋 Pré-requisitos

1. **Conta no Supabase**: [supabase.com](https://supabase.com)
2. **Conta no Vercel**: [vercel.com](https://vercel.com)
3. **Repositório GitHub**: Código já está no GitHub

---

## 🗄️ PARTE 1: Configurar Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Escolha sua organização
4. Configure:
   - **Name**: `barbearia-mv-2025`
   - **Database Password**: Crie uma senha forte
   - **Region**: South America (São Paulo)
5. Clique em **"Create new project"**
6. Aguarde a criação (2-3 minutos)

### 1.2 Executar Schema do Banco

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **"New query"**
3. Cole todo o conteúdo do arquivo `supabase_schema.sql`
4. Clique em **"Run"** para executar
5. Aguarde a conclusão ✅

### 1.3 Executar Funções do Banco

1. Ainda no **SQL Editor**, crie uma nova query
2. Cole todo o conteúdo do arquivo `supabase_functions.sql`
3. Clique em **"Run"** para executar
4. Aguarde a conclusão ✅

### 1.4 Inserir Funcionários Iniciais

1. No **SQL Editor**, crie uma nova query
2. Cole todo o conteúdo do arquivo `insert_funcionarios.sql`
3. Clique em **"Run"** para executar
4. Verifique se os 4 funcionários foram criados ✅

### 1.5 Obter Credenciais do Supabase

1. Vá para **Settings** > **API**
2. Anote as seguintes informações:
   - **Project URL**: `https://xxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ⚙️ PARTE 2: Configurar o Código

### 2.1 Atualizar Configurações do Supabase

1. Abra o arquivo `js/supabase-client.js`
2. Substitua as configurações:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://SEU_PROJECT_ID.supabase.co', // Cole sua URL aqui
    anonKey: 'SUA_CHAVE_ANON_AQUI' // Cole sua chave anon aqui
};
```

### 2.2 Atualizar HTML Principal

1. Abra o arquivo `index.html`
2. Adicione antes do `</head>`:

```html
<!-- Supabase Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-client.js"></script>
```

### 2.3 Atualizar Login para usar Supabase

1. Abra o arquivo `js/login.js`
2. Substitua a função de autenticação:

```javascript
// Substituir a função authenticateUser por:
async function authenticateUser(username, password) {
    // Tentar autenticação com Supabase primeiro
    if (window.SupabaseAuth) {
        const result = await window.SupabaseAuth.login(username, password);
        if (result.success) {
            return {
                success: true,
                user: result.funcionario
            };
        }
    }
    
    // Fallback para localStorage (desenvolvimento)
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const user = employees.find(emp => 
        emp.username === username && 
        emp.password === password && 
        emp.active
    );
    
    return {
        success: !!user,
        user: user
    };
}
```

---

## 🌐 PARTE 3: Deploy no Vercel

### 3.1 Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Conecte sua conta GitHub
4. Selecione o repositório `BarbeariaMV2025`
5. Clique em **"Import"**

### 3.2 Configurar Deploy

1. **Framework Preset**: Other
2. **Root Directory**: `./` (raiz)
3. **Build Command**: (deixe vazio)
4. **Output Directory**: `./` (raiz)
5. **Install Command**: (deixe vazio)

### 3.3 Variáveis de Ambiente (Opcional)

1. Em **Environment Variables**, adicione:
   - `SUPABASE_URL`: Sua URL do Supabase
   - `SUPABASE_ANON_KEY`: Sua chave anon

### 3.4 Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (1-2 minutos)
3. Acesse a URL gerada pelo Vercel ✅

---

## 🧪 PARTE 4: Testar o Sistema

### 4.1 Credenciais de Teste

- **Matheus (Gerente)**: `48933002321` / `matheus2025`
- **Vitor (Gerente)**: `48991199474` / `vitor2025`
- **Marcelo (Gerente)**: `48996201178` / `marcelo2025`
- **Alisson (Barbeiro)**: `48988768443` / `alisson2025`

### 4.2 Verificações

1. ✅ Login funciona com as credenciais acima
2. ✅ Redirecionamento para dashboard após login
3. ✅ Dados persistem entre sessões
4. ✅ Logout funciona corretamente

---

## 🔧 PARTE 5: Configurações Avançadas

### 5.1 Domínio Personalizado (Opcional)

1. No Vercel, vá para **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### 5.2 Monitoramento

1. **Vercel Analytics**: Ative nas configurações
2. **Supabase Logs**: Monitore no painel do Supabase

### 5.3 Backup

1. **Supabase**: Backups automáticos incluídos
2. **Código**: Já está no GitHub

---

## 🚨 Solução de Problemas

### Erro de CORS
```javascript
// Adicionar no Supabase: Settings > API > CORS Origins
// Adicionar: https://seu-dominio.vercel.app
```

### Erro de Autenticação
```sql
-- Verificar no SQL Editor do Supabase:
SELECT * FROM funcionarios;
SELECT * FROM funcionario_credenciais;
```

### Build Error no Vercel
- Verificar se todos os arquivos estão commitados
- Verificar sintaxe JavaScript
- Verificar imports/exports

---

## 📞 Suporte

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Criar issue no repositório

---

**✅ Após seguir todos os passos, seu sistema estará rodando no Vercel com banco de dados Supabase!**