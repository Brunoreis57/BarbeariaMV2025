# Configuração e Implementação do Supabase
## Sistema de Gestão para Barbearia MV 2025

### 📋 Pré-requisitos

1. **Conta no Supabase**: Crie uma conta em [supabase.com](https://supabase.com)
2. **Projeto Supabase**: Crie um novo projeto
3. **Chaves de API**: Anote a URL do projeto e as chaves `anon` e `service_role`

### 🚀 Passos para Implementação

#### 1. Executar o Schema SQL

1. Acesse o painel do Supabase
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `supabase_schema.sql`
4. Execute o script

#### 2. Configurar Autenticação

```sql
-- Habilitar autenticação por email/senha
-- (Configurar no painel: Authentication > Settings)

-- Criar função para login de funcionários
CREATE OR REPLACE FUNCTION login_funcionario(usuario_input TEXT, senha_input TEXT)
RETURNS TABLE(success BOOLEAN, funcionario_id UUID, nome TEXT, cargo TEXT) AS $$
DECLARE
    func_record RECORD;
BEGIN
    SELECT f.id, f.nome, f.cargo, fc.senha_hash
    INTO func_record
    FROM funcionarios f
    JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id
    WHERE fc.usuario = usuario_input AND fc.ativo = true AND f.ativo = true;
    
    IF func_record.id IS NOT NULL AND crypt(senha_input, func_record.senha_hash) = func_record.senha_hash THEN
        -- Atualizar último login
        UPDATE funcionario_credenciais 
        SET ultimo_login = NOW() 
        WHERE funcionario_id = func_record.id;
        
        RETURN QUERY SELECT true, func_record.id, func_record.nome, func_record.cargo;
    ELSE
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 📚 Exemplos de Uso da API

#### Configuração do Cliente Supabase

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### Autenticação de Funcionários

```javascript
// auth.js
import { supabase } from './supabase.js'

// Login de funcionário
export async function loginFuncionario(usuario, senha) {
    try {
        const { data, error } = await supabase
            .rpc('login_funcionario', {
                usuario_input: usuario,
                senha_input: senha
            })
        
        if (error) throw error
        
        if (data[0]?.success) {
            // Salvar dados do funcionário no localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                id: data[0].funcionario_id,
                nome: data[0].nome,
                cargo: data[0].cargo
            }))
            return { success: true, user: data[0] }
        } else {
            return { success: false, error: 'Credenciais inválidas' }
        }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Logout
export function logout() {
    localStorage.removeItem('currentUser')
    window.location.href = '/'
}

// Verificar se está logado
export function getCurrentUser() {
    const user = localStorage.getItem('currentUser')
    return user ? JSON.parse(user) : null
}
```

#### Gestão de Funcionários

```javascript
// funcionarios.js
import { supabase } from './supabase.js'

// Listar funcionários
export async function getFuncionarios() {
    const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('ativo', true)
        .order('nome')
    
    if (error) throw error
    return data
}

// Criar funcionário
export async function createFuncionario(funcionario) {
    const { data, error } = await supabase
        .from('funcionarios')
        .insert([funcionario])
        .select()
    
    if (error) throw error
    return data[0]
}

// Atualizar funcionário
export async function updateFuncionario(id, updates) {
    const { data, error } = await supabase
        .from('funcionarios')
        .update(updates)
        .eq('id', id)
        .select()
    
    if (error) throw error
    return data[0]
}

// Criar credenciais para funcionário
export async function createCredenciais(funcionarioId, usuario, senha) {
    const { data, error } = await supabase
        .rpc('create_funcionario_credentials', {
            funcionario_id: funcionarioId,
            usuario_input: usuario,
            senha_input: senha
        })
    
    if (error) throw error
    return data
}
```

#### Gestão de Agendamentos

```javascript
// agendamentos.js
import { supabase } from './supabase.js'

// Listar agendamentos do dia
export async function getAgendamentosDia(data) {
    const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select(`
            *,
            cliente:clientes(*),
            funcionario:funcionarios(*),
            servico:servicos(*)
        `)
        .gte('data_agendamento', `${data}T00:00:00`)
        .lt('data_agendamento', `${data}T23:59:59`)
        .order('data_agendamento')
    
    if (error) throw error
    return agendamentos
}

// Criar agendamento
export async function createAgendamento(agendamento) {
    const { data, error } = await supabase
        .from('agendamentos')
        .insert([agendamento])
        .select(`
            *,
            cliente:clientes(*),
            funcionario:funcionarios(*),
            servico:servicos(*)
        `)
    
    if (error) throw error
    return data[0]
}

// Finalizar corte (criar venda)
export async function finalizarCorte(agendamentoId, dadosVenda) {
    try {
        // Atualizar status do agendamento
        await supabase
            .from('agendamentos')
            .update({ status: 'concluido' })
            .eq('id', agendamentoId)
        
        // Criar venda
        const { data: venda, error: vendaError } = await supabase
            .from('vendas')
            .insert([{
                agendamento_id: agendamentoId,
                ...dadosVenda
            }])
            .select()
        
        if (vendaError) throw vendaError
        
        return venda[0]
    } catch (error) {
        throw error
    }
}
```

#### Gestão de Vendas e Pagamentos

```javascript
// vendas.js
import { supabase } from './supabase.js'

// Criar venda completa com itens e pagamento
export async function createVendaCompleta(vendaData, itens, pagamentos) {
    try {
        // Iniciar transação
        const { data: venda, error: vendaError } = await supabase
            .from('vendas')
            .insert([vendaData])
            .select()
        
        if (vendaError) throw vendaError
        
        const vendaId = venda[0].id
        
        // Inserir itens da venda
        const itensComVendaId = itens.map(item => ({
            ...item,
            venda_id: vendaId
        }))
        
        const { error: itensError } = await supabase
            .from('venda_itens')
            .insert(itensComVendaId)
        
        if (itensError) throw itensError
        
        // Inserir pagamentos
        const pagamentosComVendaId = pagamentos.map(pag => ({
            ...pag,
            venda_id: vendaId
        }))
        
        const { error: pagError } = await supabase
            .from('pagamentos')
            .insert(pagamentosComVendaId)
        
        if (pagError) throw pagError
        
        return venda[0]
    } catch (error) {
        throw error
    }
}

// Relatório de vendas por período
export async function getVendasPeriodo(dataInicio, dataFim) {
    const { data, error } = await supabase
        .from('vw_vendas_diarias')
        .select('*')
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: false })
    
    if (error) throw error
    return data
}
```

#### Relatórios e Dashboard

```javascript
// relatorios.js
import { supabase } from './supabase.js'

// Dados do dashboard
export async function getDashboardData() {
    const hoje = new Date().toISOString().split('T')[0]
    
    try {
        // Dados diários
        const { data: dadosDiarios } = await supabase
            .from('dados_diarios')
            .select('*')
            .eq('data_referencia', hoje)
            .single()
        
        // Agendamentos de hoje
        const { data: agendamentosHoje } = await supabase
            .from('agendamentos')
            .select('*')
            .gte('data_agendamento', `${hoje}T00:00:00`)
            .lt('data_agendamento', `${hoje}T23:59:59`)
        
        // Ranking de funcionários (mês atual)
        const { data: ranking } = await supabase
            .from('vw_ranking_funcionarios')
            .select('*')
        
        return {
            dadosDiarios: dadosDiarios || {
                total_vendas: 0,
                total_cortes: 0,
                lucro_liquido: 0
            },
            agendamentosHoje: agendamentosHoje || [],
            rankingFuncionarios: ranking || []
        }
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        return {
            dadosDiarios: { total_vendas: 0, total_cortes: 0, lucro_liquido: 0 },
            agendamentosHoje: [],
            rankingFuncionarios: []
        }
    }
}

// Comissões por funcionário
export async function getComissoesFuncionario(funcionarioId, mes, ano) {
    const { data, error } = await supabase
        .from('comissoes')
        .select(`
            *,
            venda:vendas(*)
        `)
        .eq('funcionario_id', funcionarioId)
        .gte('data_calculo', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('data_calculo', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`)
        .order('data_calculo', { ascending: false })
    
    if (error) throw error
    return data
}
```

### 🔒 Configurações de Segurança

#### Políticas RLS Adicionais

```sql
-- Política para clientes (todos os funcionários podem ver)
CREATE POLICY "Funcionarios podem gerenciar clientes" ON clientes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM funcionario_credenciais fc 
            WHERE fc.usuario = auth.jwt() ->> 'sub' AND fc.ativo = true
        )
    );

-- Política para serviços e produtos (leitura para todos, escrita para gerentes)
CREATE POLICY "Todos podem ver servicos" ON servicos
    FOR SELECT USING (true);

CREATE POLICY "Gerentes podem gerenciar servicos" ON servicos
    FOR INSERT, UPDATE, DELETE USING (
        EXISTS (
            SELECT 1 FROM funcionarios f 
            JOIN funcionario_credenciais fc ON f.id = fc.funcionario_id 
            WHERE fc.usuario = auth.jwt() ->> 'sub' AND f.cargo = 'gerente'
        )
    );
```

### 📊 Monitoramento e Logs

```sql
-- Tabela para logs de auditoria
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela VARCHAR(50) NOT NULL,
    operacao VARCHAR(10) NOT NULL,
    dados_antigos JSONB,
    dados_novos JSONB,
    usuario_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (tabela, operacao, dados_antigos, dados_novos, usuario_id)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        COALESCE(NEW.funcionario_id, OLD.funcionario_id)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar auditoria nas tabelas principais
CREATE TRIGGER audit_vendas AFTER INSERT OR UPDATE OR DELETE ON vendas
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_funcionarios AFTER INSERT OR UPDATE OR DELETE ON funcionarios
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

### 🚀 Deploy e Manutenção

#### Backup Automático

```sql
-- Função para backup diário
CREATE OR REPLACE FUNCTION backup_dados_diarios()
RETURNS void AS $$
BEGIN
    -- Criar snapshot dos dados importantes
    INSERT INTO backup_vendas 
    SELECT * FROM vendas 
    WHERE DATE(data_venda) = CURRENT_DATE - INTERVAL '1 day';
    
    -- Limpar logs antigos (manter apenas 30 dias)
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Agendar execução diária (configurar no painel do Supabase)
```

### 📱 Integração com o Frontend

#### Instalação das Dependências

```bash
npm install @supabase/supabase-js
```

#### Estrutura de Arquivos Sugerida

```
js/
├── supabase/
│   ├── supabase.js          # Configuração do cliente
│   ├── auth.js              # Autenticação
│   ├── funcionarios.js      # Gestão de funcionários
│   ├── clientes.js          # Gestão de clientes
│   ├── agendamentos.js      # Gestão de agendamentos
│   ├── vendas.js            # Gestão de vendas
│   ├── relatorios.js        # Relatórios e dashboard
│   └── utils.js             # Utilitários
└── ...
```

### ✅ Checklist de Implementação

- [ ] Criar projeto no Supabase
- [ ] Executar schema SQL
- [ ] Configurar variáveis de ambiente
- [ ] Implementar autenticação
- [ ] Migrar dados existentes do localStorage
- [ ] Testar todas as funcionalidades
- [ ] Configurar políticas de segurança
- [ ] Implementar backup automático
- [ ] Documentar APIs para a equipe
- [ ] Treinar usuários no novo sistema

### 🆘 Troubleshooting

#### Problemas Comuns

1. **Erro de RLS**: Verificar se as políticas estão configuradas corretamente
2. **Timeout de conexão**: Verificar se a URL e chaves estão corretas
3. **Erro de permissão**: Verificar se o usuário tem as permissões necessárias
4. **Dados não aparecem**: Verificar se as políticas RLS não estão bloqueando o acesso

#### Logs e Debug

```javascript
// Habilitar logs detalhados
supabase.auth.debug = true

// Interceptar erros
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session)
})
```

---

**Nota**: Este documento serve como guia completo para implementação. Ajuste as configurações conforme suas necessidades específicas de segurança e performance.