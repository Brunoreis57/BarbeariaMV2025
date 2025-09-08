// Sistema de Importação de Dados Históricos
// Processa dados de julho e agosto de 2024

class ImportadorHistorico {
    constructor() {
        this.dadosProcessados = [];
        this.servicosMap = new Map();
        this.formasPagamentoMap = new Map([
            ['PIX', 'pix'],
            ['DEB', 'debito'],
            ['CRED', 'credito'],
            ['DINH', 'dinheiro'],
            ['DINHEIRO', 'dinheiro'],
            ['PLANO', 'plano']
        ]);
    }

    // Processar dados brutos do usuário
    processarDadosHistoricos(dadosBrutos) {
        console.log('🔄 Iniciando processamento de dados históricos...');
        
        const linhas = dadosBrutos.split('\n').filter(linha => linha.trim());
        const transacoes = [];
        
        linhas.forEach((linha, index) => {
            try {
                const transacao = this.processarLinha(linha);
                if (transacao) {
                    transacoes.push(transacao);
                }
            } catch (error) {
                console.warn(`⚠️ Erro na linha ${index + 1}: ${error.message}`);
            }
        });
        
        console.log(`✅ Processadas ${transacoes.length} transações`);
        return transacoes;
    }

    // Processar uma linha individual
    processarLinha(linha) {
        // Regex para capturar os dados da linha
        const regex = /^(\d{2}\/\w{3})\s+(.+?)\s+R\$([\d,-]+)\s+(\w+)\s+(.*)\s+PG\s+(\w+)\s+R\$\s*([\d,.\s-]+)$/;
        const match = linha.match(regex);
        
        if (!match) {
            console.warn(`Linha não reconhecida: ${linha}`);
            return null;
        }
        
        const [, dataStr, servico, valorStr, formaPagamento, cliente, funcionario, comissaoStr] = match;
        
        // Processar data
        const data = this.processarData(dataStr);
        
        // Processar valor
        const valor = this.processarValor(valorStr);
        
        // Processar forma de pagamento
        const formaPagamentoNormalizada = this.formasPagamentoMap.get(formaPagamento) || formaPagamento.toLowerCase();
        
        // Processar comissão
        const comissao = this.processarValor(comissaoStr);
        
        // Limpar nome do cliente
        const clienteNome = cliente.trim().replace(/\d+/g, '').trim() || 'Cliente não informado';
        
        return {
            id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            data: data,
            servico: servico.trim(),
            valor: valor,
            formaPagamento: formaPagamentoNormalizada,
            cliente: clienteNome,
            funcionario: funcionario.trim(),
            comissao: comissao,
            timestamp: new Date(data).toISOString(),
            tipo: 'historico',
            origem: 'importacao_julho_agosto_2024'
        };
    }

    // Processar string de data (21/jul -> 2024-07-21)
    processarData(dataStr) {
        const mesesMap = {
            'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
            'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
            'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
        };
        
        const [dia, mesAbrev] = dataStr.split('/');
        const mes = mesesMap[mesAbrev.toLowerCase()];
        const ano = '2024'; // Dados são de 2024
        
        return `${ano}-${mes}-${dia.padStart(2, '0')}`;
    }

    // Processar string de valor (R$50,00 -> 50.00)
    processarValor(valorStr) {
        if (!valorStr || valorStr.includes('-')) return 0;
        
        return parseFloat(
            valorStr
                .replace(/R\$/g, '')
                .replace(/\s/g, '')
                .replace(',', '.')
        ) || 0;
    }

    // Salvar dados no localStorage
    salvarDadosHistoricos(transacoes) {
        console.log('💾 Salvando dados históricos no localStorage...');
        
        // Obter dados existentes
        const salesExistentes = JSON.parse(localStorage.getItem('sales') || '{}');
        const transacoesExistentes = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Agrupar transações por data
        const transacoesPorData = {};
        
        transacoes.forEach(transacao => {
            const data = transacao.data;
            
            if (!transacoesPorData[data]) {
                transacoesPorData[data] = [];
            }
            
            transacoesPorData[data].push(transacao);
        });
        
        // Adicionar ao sistema de vendas
        Object.keys(transacoesPorData).forEach(data => {
            if (!salesExistentes[data]) {
                salesExistentes[data] = [];
            }
            
            salesExistentes[data] = salesExistentes[data].concat(transacoesPorData[data]);
        });
        
        // Adicionar ao sistema de transações
        const novasTransacoes = transacoes.map(t => ({
            id: t.id,
            date: t.data,
            type: 'receita',
            category: 'Serviços',
            description: `${t.servico} - ${t.cliente}`,
            amount: t.valor,
            paymentMethod: t.formaPagamento,
            employee: t.funcionario,
            commission: t.comissao,
            source: 'historico'
        }));
        
        // Salvar no localStorage
        localStorage.setItem('sales', JSON.stringify(salesExistentes));
        localStorage.setItem('transactions', JSON.stringify([...transacoesExistentes, ...novasTransacoes]));
        
        // Atualizar estatísticas
        this.atualizarEstatisticas(transacoes);
        
        console.log(`✅ ${transacoes.length} transações salvas com sucesso!`);
        
        return {
            totalTransacoes: transacoes.length,
            valorTotal: transacoes.reduce((sum, t) => sum + t.valor, 0),
            periodo: this.obterPeriodoImportacao(transacoes)
        };
    }

    // Atualizar estatísticas do dashboard
    atualizarEstatisticas(transacoes) {
        const estatisticas = JSON.parse(localStorage.getItem('dashboardStats') || '{}');
        
        const valorTotal = transacoes.reduce((sum, t) => sum + t.valor, 0);
        const totalCortes = transacoes.length;
        const totalComissoes = transacoes.reduce((sum, t) => sum + t.comissao, 0);
        
        // Atualizar estatísticas gerais
        estatisticas.historicoImportado = {
            valorTotal,
            totalCortes,
            totalComissoes,
            lucroLiquido: valorTotal - totalComissoes,
            dataImportacao: new Date().toISOString()
        };
        
        localStorage.setItem('dashboardStats', JSON.stringify(estatisticas));
    }

    // Obter período da importação
    obterPeriodoImportacao(transacoes) {
        const datas = transacoes.map(t => t.data).sort();
        return {
            inicio: datas[0],
            fim: datas[datas.length - 1]
        };
    }

    // Gerar relatório da importação
    gerarRelatorioImportacao(resultado) {
        return {
            resumo: {
                totalTransacoes: resultado.totalTransacoes,
                valorTotal: resultado.valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                periodo: `${resultado.periodo.inicio} a ${resultado.periodo.fim}`
            },
            detalhes: {
                funcionarios: this.obterEstatisticasFuncionarios(),
                formasPagamento: this.obterEstatisticasFormaPagamento(),
                servicosMaisVendidos: this.obterServicosPopulares()
            }
        };
    }

    // Estatísticas por funcionário
    obterEstatisticasFuncionarios() {
        const sales = JSON.parse(localStorage.getItem('sales') || '{}');
        const funcionarios = {};
        
        Object.values(sales).flat().forEach(venda => {
            if (venda.origem === 'importacao_julho_agosto_2024') {
                if (!funcionarios[venda.funcionario]) {
                    funcionarios[venda.funcionario] = {
                        vendas: 0,
                        receita: 0,
                        comissoes: 0
                    };
                }
                
                funcionarios[venda.funcionario].vendas++;
                funcionarios[venda.funcionario].receita += venda.valor;
                funcionarios[venda.funcionario].comissoes += venda.comissao;
            }
        });
        
        return funcionarios;
    }

    // Estatísticas por forma de pagamento
    obterEstatisticasFormaPagamento() {
        const sales = JSON.parse(localStorage.getItem('sales') || '{}');
        const formas = {};
        
        Object.values(sales).flat().forEach(venda => {
            if (venda.origem === 'importacao_julho_agosto_2024') {
                if (!formas[venda.formaPagamento]) {
                    formas[venda.formaPagamento] = {
                        quantidade: 0,
                        valor: 0
                    };
                }
                
                formas[venda.formaPagamento].quantidade++;
                formas[venda.formaPagamento].valor += venda.valor;
            }
        });
        
        return formas;
    }

    // Serviços mais populares
    obterServicosPopulares() {
        const sales = JSON.parse(localStorage.getItem('sales') || '{}');
        const servicos = {};
        
        Object.values(sales).flat().forEach(venda => {
            if (venda.origem === 'importacao_julho_agosto_2024') {
                if (!servicos[venda.servico]) {
                    servicos[venda.servico] = {
                        quantidade: 0,
                        receita: 0
                    };
                }
                
                servicos[venda.servico].quantidade++;
                servicos[venda.servico].receita += venda.valor;
            }
        });
        
        return Object.entries(servicos)
            .sort(([,a], [,b]) => b.quantidade - a.quantidade)
            .slice(0, 10);
    }
}

// Função principal para importar dados
function importarDadosHistoricos(dadosBrutos) {
    const importador = new ImportadorHistorico();
    
    try {
        console.log('🚀 Iniciando importação de dados históricos...');
        
        // Processar dados
        const transacoes = importador.processarDadosHistoricos(dadosBrutos);
        
        if (transacoes.length === 0) {
            throw new Error('Nenhuma transação válida encontrada nos dados fornecidos');
        }
        
        // Salvar no sistema
        const resultado = importador.salvarDadosHistoricos(transacoes);
        
        // Gerar relatório
        const relatorio = importador.gerarRelatorioImportacao(resultado);
        
        console.log('✅ Importação concluída com sucesso!');
        console.log('📊 Relatório:', relatorio);
        
        return {
            sucesso: true,
            resultado,
            relatorio,
            transacoes
        };
        
    } catch (error) {
        console.error('❌ Erro na importação:', error);
        return {
            sucesso: false,
            erro: error.message
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ImportadorHistorico = ImportadorHistorico;
    window.importarDadosHistoricos = importarDadosHistoricos;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImportadorHistorico, importarDadosHistorico };
}