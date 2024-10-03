document.addEventListener('DOMContentLoaded', () => {
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            displayEmpenho: params.get('displayEmpenho'),
            displayOrdemCompra: params.get('displayOrdemCompra'),
            displayNup: params.get('displayNup'),
            displaydtagendamento: params.get('displaydtagendamento'),
            displayFornecedor: params.get('displayFornecedor'),
            
            displayArpContratoPregao: params.get('displayArpContratoPregao'),
            displayDtEmpenho: params.get('displayDtEmpenho'),
            displayDtRecebimentoFornecedor: params.get('displayDtRecebimentoFornecedor'),
            displayProjeto: params.get('displayProjeto'),
            displayPrioridade: params.get('displayPrioridade'),
            displayDtNotificacao: params.get('displayDtNotificacao'),
            displayInformacoesCopla: params.get('displayInformacoesCopla'),
            displayNotificacao: params.get('displayNotificacao'),
            displayObservacoes: params.get('displayObservacoes'),
            displayStatus: params.get('displayStatus'),
            displayResponsavel: params.get('displayResponsavel'),
            itens: JSON.parse(decodeURIComponent(params.get('itens')))
        };
    }

    const params = getQueryParams();
    if (params.displayEmpenho && params.displayOrdemCompra) {
        const empenhoField = document.getElementById('empenhoField');
        const ordemCompraField = document.getElementById('ordemCompraField');
        const nupField = document.getElementById('nupField');
        const dtagendamentoField = document.getElementById('dtagendamentoField');
        const fornecedorField = document.getElementById('fornecedorField');
        const arpContratoPregaoField = document.getElementById('arpContratoPregaoField');
        const dtEmpenhoField = document.getElementById('dtEmpenhoField');
        
        const dtRecebimentoFornecedorField = document.getElementById('dtRecebimentoFornecedorField');
        const projetoField = document.getElementById('projetoField');
        const prioridadeField = document.getElementById('prioridadeField');
        const dtNotificacaoField = document.getElementById('dtNotificacaoField');
        const informacoesCoplaField = document.getElementById('informacoesCoplaField');
        const notificacaoField = document.getElementById('notificacaoField');
        const observacoesField = document.getElementById('observacoesField');
        const statusField = document.getElementById('statusField');
        const responsavelField = document.getElementById('responsavelField');
        const itemsTableBody = document.querySelector('#itemsTable tbody');
        // Função para formatar números para moeda brasileira com 4 casas decimais
        function formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 4,  // Garante que sempre tenha 4 casas decimais
                maximumFractionDigits: 4   // Garante que não tenha mais de 4 casas decimais
            }).format(value);
        }
        // Função para formatar a data para o formato YYYY-MM-DD
        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        }

        // Preencher os campos com os valores
        empenhoField.value = params.displayEmpenho;
        ordemCompraField.value = params.displayOrdemCompra;
        nupField.value = params.displayNup;
        dtagendamentoField.value = formatDate(params.displaydtagendamento);
        fornecedorField.value = params.displayFornecedor;
        arpContratoPregaoField.value = params.displayArpContratoPregao;
        dtEmpenhoField.value = formatDate(params.displayDtEmpenho);
        dtRecebimentoFornecedorField.value = formatDate(params.displayDtRecebimentoFornecedor);
        projetoField.value = params.displayProjeto;
        prioridadeField.value = params.displayPrioridade;
        dtNotificacaoField.value = formatDate(params.displayDtNotificacao);
        informacoesCoplaField.value = params.displayInformacoesCopla;
        notificacaoField.value = params.displayNotificacao;
        observacoesField.value = params.displayObservacoes;
        statusField.value = params.displayStatus;
        responsavelField.value = params.displayResponsavel;

        // Preencher a tabela com os itens
        if (params.itens && Array.isArray(params.itens)) {
            params.itens.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.codigo}</td>
                    <td>${item.descricao}</td>
                    <td>${item.apresentacao}</td>
                    <td>${item.marca}</td>
                    <td>${item.qtdSolicitada}</td>
                    <td>${formatCurrency(item.valorUnitario)}</td>
                    <td>${formatCurrency(item.valorTotal)}</td>
                `;
                itemsTableBody.appendChild(row);
            });
        }

        // Defina quais campos são editáveis
        empenhoField.disabled = true;
        ordemCompraField.disabled = true;
        nupField.disabled = true;
        fornecedorField.disabled = true;
        arpContratoPregaoField.disabled = true;
        dtEmpenhoField.disabled = true;
        dtRecebimentoFornecedorField.disabled = true;
        dtagendamentoField.disabled = false;
        projetoField.disabled = true;
        prioridadeField.disabled = true;
        dtNotificacaoField.disabled = true;
        informacoesCoplaField.disabled = false;
        notificacaoField.disabled = false;
        observacoesField.disabled = false;
        statusField.disabled = true;
        responsavelField.disabled = true;
    // Função para buscar item pelo código no banco de dados
    function fetchItemByCodigo(codigo) {
        console.log(`Buscando item com código: ${codigo}`); // Log para depuração
        fetch(`/api/novoItem/${codigo}`)
            .then(response => response.json())
            .then(item => {
                console.log('Resposta da API:', item); // Log para depuração
                const descricaoRecebidoField = document.getElementById('descricaoRecebidoField');
                if (item && item.codigo) { // Ajustado para verificar o campo 'codigo'
                    descricaoRecebidoField.value = item.descricao; // Preenche o campo com a descrição do item
                } else {
                    descricaoRecebidoField.value = ''; // Limpa o campo se o item não for encontrado
                    showNotification('Item não encontrado.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar item:', error);
                showNotification('Erro ao buscar item.');
            });
    }

    // Adiciona o event listener para o campo codigoRecebidoField
    const codigoRecebidoField = document.getElementById('codigoRecebidoField');
    if (codigoRecebidoField) {
        codigoRecebidoField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Previne o comportamento padrão de Enter
                const codigo = codigoRecebidoField.value.trim(); // Remove espaços extras
                if (codigo) {
                    fetchItemByCodigo(codigo); // Chama a função para buscar o item
                } else {
                    showNotification('Digite um código de item válido.');
                }
            }
        });
    }

        // Função para formatar valores para moeda brasileira
        function formatToCurrency(value) {
            if (value === '') return '';
            const number = parseFloat(value.replace(/[^\d]/g, '')) / 10000; // Divide por 10000 para ajustar a exibição
            const formattedValue = new Intl.NumberFormat('pt-BR', { 
                minimumFractionDigits: 4, 
                maximumFractionDigits: 4 
            }).format(number);
        
            return `R$ ${formattedValue}`; // Adiciona o prefixo R$
        }
        
        function parseCurrency(value) {
            return parseFloat(value.replace(/[^\d]/g, '')) / 10000; // Também divide por 10000 aqui
        }

        function handleInput(event) {
            const input = event.target;
            input.value = formatToCurrency(input.value);
        }

        // Adiciona a formatação de moeda ao campo de valor unitário
        const valorUnitarioInput = document.getElementById('valorUniRecebidoField');
        valorUnitarioInput.addEventListener('input', handleInput);

        function updateItemValorTotal() {
            const quantidadeRecebidoField = document.getElementById('quantidadeRecebidoField');
            const valorUnitarioField = document.getElementById('valorUniRecebidoField');
            const valorTotalField = document.getElementById('valortotalRecebidoField');

            function handleUpdate() {
                const qtd = parseFloat(quantidadeRecebidoField.value) || 0;
                const valorUnitario = parseCurrency(valorUnitarioField.value) || 0;
                const valorTotal = qtd * valorUnitario;
                valorTotalField.value = formatToCurrency(valorTotal.toFixed(4));
            }

            quantidadeRecebidoField.addEventListener('input', handleUpdate);
            valorUnitarioField.addEventListener('input', handleUpdate);
        }

        updateItemValorTotal();
        // Criação dos dropdowns para projeto, prioridade e status
        const projetoOptions = [
            'PROJETO JUDICIAL', 'DST/AIDS', 'ODONTOLÓGICO', 'GESTÃO HOSPITALAR', 'AFB',
            'PORTARIA Nº 3.385 INCREMENTO AFB', 'ESTRATÉGICOS', 'ESPECIALIZADO', 'AFS',
            'SAUDE DA MULHER', 'INFECÇÃO OPORTUNISTA', 'PROJETO OSTOMIZADO', 'TESOURO',
            'CEBUC', 'COAD', 'ONCOLÓGICO', 'COVID', 'HEPATITE'
        ];
        const prioridadeOptions = ['zero','crítica', 'baixa', 'média', 'alta'];
        const statusOptions = [
            { status: 'Emitido', color: '#00f' }, // Azul, frio
            { status: 'Aguardando Agendamento', color: '#4b8bbE' }, // Azul claro
            { status: 'Agendado Parcial', color: '#007bff' }, // Azul
            { status: 'Entregue Parcial', color: '#00bfff' }, // Azul claro
            { status: 'Agendado Total', color: '#32cd32' }, // Verde limão
            { status: 'Entregue Total', color: '#00ff00' }, // Verde
            { status: 'Pendência Fornecedor', color: '#ffff00' }, // Amarelo
            { status: 'Entregue ao Financeiro', color: '#ffcc00' }, // Amarelo ouro
            { status: 'Empenho Pago', color: '#0AE302' }, 
            { status: 'Empenho Cancelado', color: '#ff0000' } // Vermelho, quente
        ];

        function createDropdown(id, options, selectedValue) {
            const dropdown = document.createElement('select');
            dropdown.id = id;
            dropdown.className = 'dropdown';
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.status;
                optionElement.textContent = option.status;
                if (option.status === selectedValue) {
                    optionElement.selected = true;
                }
                optionElement.style.backgroundColor = option.color; // Define a cor de fundo
                 // Define a cor do texto como branco
                optionElement.style.fontWeight = 'bold'; // Define o texto como negrito
                dropdown.appendChild(optionElement);
            });
            return dropdown;
        }

        const projetoDropdown = createDropdown('projetoDropdown', projetoOptions.map(p => ({ status: p })), params.displayProjeto);
        const prioridadeDropdown = createDropdown('prioridadeDropdown', prioridadeOptions.map(p => ({ status: p })), params.displayPrioridade);
        const statusDropdown = createDropdown('statusDropdown', statusOptions, params.displayStatus);

        const projetoButton = document.getElementById('projetoButton');
        const prioridadeButton = document.getElementById('prioridadeButton');
        const statusButton = document.getElementById('statusButton');

        projetoButton.addEventListener('click', () => {
            const dropdown = document.getElementById('projetoDropdown');
            if (dropdown) {
                projetoField.parentNode.removeChild(dropdown);
                projetoField.style.display = 'inline';
                projetoButton.textContent = 'Alterar';
            } else {
                projetoField.style.display = 'none';
                projetoField.parentNode.appendChild(projetoDropdown);
                projetoButton.textContent = 'Cancelar';
            }
        });

        prioridadeButton.addEventListener('click', () => {
            const dropdown = document.getElementById('prioridadeDropdown');
            if (dropdown) {
                prioridadeField.parentNode.removeChild(dropdown);
                prioridadeField.style.display = 'inline';
                prioridadeButton.textContent = 'Alterar';
            } else {
                prioridadeField.style.display = 'none';
                prioridadeField.parentNode.appendChild(prioridadeDropdown);
                prioridadeButton.textContent = 'Cancelar';
            }
        });

        statusButton.addEventListener('click', () => {
            const dropdown = document.getElementById('statusDropdown');
            if (dropdown) {
                statusField.parentNode.removeChild(dropdown);
                statusField.style.display = 'inline';
                statusButton.textContent = 'Alterar';
            } else {
                statusField.style.display = 'none';
                statusField.parentNode.appendChild(statusDropdown);
                statusButton.textContent = 'Cancelar';
            }
        });

        // Atualiza o valor dos campos com a seleção do dropdown
        projetoDropdown.addEventListener('change', () => {
            projetoField.value = projetoDropdown.value;
            projetoField.style.display = 'inline';
            projetoDropdown.parentNode.removeChild(projetoDropdown);
            projetoButton.textContent = 'Alterar';
        });

        prioridadeDropdown.addEventListener('change', () => {
            prioridadeField.value = prioridadeDropdown.value;
            prioridadeField.style.display = 'inline';
            prioridadeDropdown.parentNode.removeChild(prioridadeDropdown);
            prioridadeButton.textContent = 'Alterar';
        });

        statusDropdown.addEventListener('change', () => {
            statusField.value = statusDropdown.value;
            statusField.style.display = 'inline';
            statusDropdown.parentNode.removeChild(statusDropdown);
            statusButton.textContent = 'Alterar';
        });

        // Função para criar um campo de entrada de data
        function createDateInput(id, value) {
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.id = id;
            dateInput.value = formatDate(value);
            return dateInput;
        }

        // Criação dos campos de data
        const dtNotificacaoInput = createDateInput('dtNotificacaoInput', params.displayDtNotificacao);
        const dtRecebimentoFornecedorInput = createDateInput('dtRecebimentoFornecedorInput', params.displayDtRecebimentoFornecedor);

        const dtNotificacaoButton = document.getElementById('dtNotificacaoButton');
        const dtRecebimentoFornecedorButton = document.getElementById('dtfornecedorButton');

        dtNotificacaoButton.addEventListener('click', () => {
            const dateInput = document.getElementById('dtNotificacaoInput');
            if (dateInput) {
                dtNotificacaoField.parentNode.removeChild(dateInput);
                dtNotificacaoField.style.display = 'inline';
                dtNotificacaoButton.textContent = 'Alterar';
            } else {
                dtNotificacaoField.style.display = 'none';
                dtNotificacaoField.parentNode.appendChild(dtNotificacaoInput);
                dtNotificacaoButton.textContent = 'Cancelar';
            }
        });

        dtRecebimentoFornecedorButton.addEventListener('click', () => {
            const dateInput = document.getElementById('dtRecebimentoFornecedorInput');
            if (dateInput) {
                dtRecebimentoFornecedorField.parentNode.removeChild(dateInput);
                dtRecebimentoFornecedorField.style.display = 'inline';
                dtRecebimentoFornecedorButton.textContent = 'Alterar';
            } else {
                dtRecebimentoFornecedorField.style.display = 'none';
                dtRecebimentoFornecedorField.parentNode.appendChild(dtRecebimentoFornecedorInput);
                dtRecebimentoFornecedorButton.textContent = 'Cancelar';
            }
        });

        // Atualiza o valor dos campos com a seleção do date input
        dtNotificacaoInput.addEventListener('change', () => {
            dtNotificacaoField.value = dtNotificacaoInput.value;
            dtNotificacaoField.style.display = 'inline';
            dtNotificacaoInput.parentNode.removeChild(dtNotificacaoInput);
            dtNotificacaoButton.textContent = 'Alterar';
        });

        dtRecebimentoFornecedorInput.addEventListener('change', () => {
            dtRecebimentoFornecedorField.value = dtRecebimentoFornecedorInput.value;
            dtRecebimentoFornecedorField.style.display = 'inline';
            dtRecebimentoFornecedorInput.parentNode.removeChild(dtRecebimentoFornecedorInput);
            dtRecebimentoFornecedorButton.textContent = 'Alterar';
        });

        document.getElementById('salvarButton').addEventListener('click', async () => {
            if (confirm('❗Você realmente deseja salvar as alterações?\nNão esqueça de alterar o status se necessário.')) {
                // Coletando os valores dos campos
                const empenho = document.getElementById('empenhoField').value;
                const responsavel = document.getElementById('responsavelField').value;
                const status = document.getElementById('statusField').value;
        
                // Obtendo data e hora atuais
                const now = new Date();
                const dataHora = now.toLocaleString('pt-BR'); // Formato de data e hora em português
        
                // Coleta os dados dos outros campos
                const ocData = {
                    empenho: empenhoField.value,
                    nup: nupField.value,
                    ordemCompra: ordemCompraField.value,
                    fornecedor: fornecedorField.value,
                    arpContratoPregao: arpContratoPregaoField.value,
                    dtEmpenho: dtEmpenhoField.value,
                    dtRecebimentoFornecedor: dtRecebimentoFornecedorField.value,
                    projeto: projetoField.value,
                    prioridade: prioridadeField.value,
                    dtNotificacao: dtNotificacaoField.value,
                    informacoesCopla: informacoesCoplaField.value,
                    notificacao: notificacaoField.value,
                    observacoes: observacoesField.value,
                    dtagendamento: dtagendamentoField.value,
                    status: status,
                    responsavel: responsavel
                };
        
                // Coleta os itens da tabela
                const itens = [];
                const rows = itemsTableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    itens.push({
                        codigo: cells[0].textContent,
                        descricao: cells[1].textContent,
                        apresentacao: cells[2].textContent,
                        marca: cells[3].textContent,
                        qtdSolicitada: parseInt(cells[4].textContent, 10),
                        valorUnitario: parseFloat(cells[5].textContent.replace('R$', '').replace('.', '').replace(',', '.')),
                        valorTotal: parseFloat(cells[6].textContent.replace('R$', '').replace('.', '').replace(',', '.'))
                    });
                });
        
                // Coleta os comentários da tabela, evitando duplicatas
                const comentariosArray = [];
                const comentariosRows = document.getElementById('ComentariosTable').getElementsByTagName('tbody')[0].rows;
                const comentariosSet = new Set(); // Para evitar duplicatas
        
                for (let i = 0; i < comentariosRows.length; i++) {
                    const row = comentariosRows[i];
                    const comentario = {
                        user: row.cells[0].textContent,
                        empenho: row.cells[1].textContent,
                        novoComentario: row.cells[2].textContent,
                        datahora: row.cells[3].textContent
                    };
        
                    // Adiciona ao conjunto se não existir
                    comentariosSet.add(JSON.stringify(comentario));
                }
        
                // Converte de volta para um array
                comentariosArray.push(...Array.from(comentariosSet).map(item => JSON.parse(item)));
        
                // Enviar dados para o servidor
                try {
                    const response = await fetch('/api/atualizar-oc', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ ocData, itens })
                    });
        
                    const result = await response.json();
                    if (response.ok) {
                        console.log(result.message);
        
                        // Enviando os dados adicionais
                        const responseInformacoes = await fetch('/api/salvar-informacoes', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ empenho, responsavel, status, dataHora })
                        });
        
                        const resultInformacoes = await responseInformacoes.json();
                        if (responseInformacoes.ok) {
                            console.log(resultInformacoes.message);
        
                            // Salvar comentários no banco, se houver
                            if (comentariosArray.length > 0) {
                                const responseComentarios = await fetch('/api/comentarios', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(comentariosArray)
                                });
        
                                const resultComentarios = await responseComentarios.json();
                                if (responseComentarios.ok) {
                                    console.log('Comentários salvos com sucesso:', resultComentarios);
                                } else {
                                    console.error('Erro ao salvar comentários:', resultComentarios.message);
                                }
                            } else {
                                console.log('Nenhum comentário novo para salvar.');
                            }
        
                            // Alerta de sucesso e redirecionamento
                            alert('Alterações salvas com sucesso!');
                            window.location.href = '../home.html';
        
                            // Atualizar a tabela após um delay
                            setTimeout(async () => {
                                await atualizarTabela(empenho);
                            }, 1000); // Delay de 1000ms (1 segundo)
                        } else {
                            console.error('Erro ao salvar informações:', resultInformacoes.message);
                            alert('Erro ao salvar informações.');
                        }
                    } else {
                        console.error('Erro ao salvar:', result.message);
                        alert('Erro ao salvar as alterações');
                    }
                } catch (error) {
                    console.error('Erro ao enviar requisição:', error);
                    alert('Erro ao enviar requisição.');
                }
            }
        });
        
        // Adicionando a funcionalidade de excluir itens
        document.getElementById('excluirButton').addEventListener('click', () => {
            if (confirm('❗Você realmente deseja excluir todos os itens da tabela?')) {
                while (itemsTableBody.firstChild) {
                    itemsTableBody.removeChild(itemsTableBody.firstChild);
                }
            }
        });
    }
});
document.getElementById('salvarButton').addEventListener('click', () => {
    // Função para remover os separadores de milhar e converter vírgula decimal para ponto
    const parseCurrency = (value) => {
        return parseFloat(value.replace(/\./g, '').replace(',', '.').replace('R$', '').trim());
    };

    // Coleta os itens recebidos da tabela
    const itensRecebidos = [];
    const rows = document.querySelectorAll('#recebidosTable tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        itensRecebidos.push({
            dtrecebimento: cells[0].textContent,
            Nnota:cells[1].textContent,
            codigo: cells[2].textContent,
            descricao: cells[3].textContent,
            apresentacao: cells[4].textContent,
            marca: cells[5].textContent,
            qtdRecebida: parseInt(cells[6].textContent, 10),
            valorUnitario: parseCurrency(cells[7].textContent),  // Remover pontos e substituir vírgulas por pontos
            valorTotal: parseCurrency(cells[8].textContent),     // Remover pontos e substituir vírgulas por pontos
            entregueNosConformes: cells[9].textContent,
            cartaDeTroca: cells[10].textContent
        });
    });

        // Dados a serem enviados para o servidor
        const empenho = document.getElementById('empenhoField').value;

        fetch('/api/atualizar-oc-recebidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ empenho, itensRecebidos })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Erro ao salvar itens recebidos:', error);
            alert('Erro ao salvar os itens recebidos');
        });
    }
);
document.getElementById('addRecebidoButton').addEventListener('click', function () {
    const form = document.getElementById('recebidosForm');

    // Verifica se o formulário é válido
    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        form.reportValidity(); // Mostra mensagens de erro do navegador
        return;
    }

    // Função para tratar números formatados com separadores de milhar e decimais
    function parseNumber(value) {
        // Remove qualquer caractere não numérico, exceto vírgula e ponto
        const cleanedValue = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
        return parseFloat(cleanedValue);
    }

    // Função para formatar o número no estilo brasileiro
    function formatNumber(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Captura os valores dos campos do formulário
    const dtrecebimento = document.getElementById('dtrecebimento').value;
    const Nnota = document.getElementById('Nnota').value;
    const codigoRecebido = document.getElementById('codigoRecebidoField').value;
    const descricaoRecebido = document.getElementById('descricaoRecebidoField').value;
    const apresentacaoRecebido = document.getElementById('apresentacaoRecebidoField').value;
    const marcaRecebido = document.getElementById('marcaRecebidoField').value;
    const quantidadeRecebida = document.getElementById('quantidadeRecebidoField').value;
    const valorUnitario = document.getElementById('valorUniRecebidoField').value;

    // Verifica se os campos obrigatórios estão preenchidos
    if (!dtrecebimento || !Nnota || !codigoRecebido || !descricaoRecebido || !apresentacaoRecebido || !marcaRecebido || !quantidadeRecebida) {
        alert('Os campos Data, Código, Descrição, Apresentação, Marca e Quantidade são obrigatórios.');
        return;
    }

    // Cálculo do valor total
    const valorTotal = (parseNumber(quantidadeRecebida) * parseNumber(valorUnitario)).toFixed(2);

    // Atualiza o campo de valor total no formulário
    document.getElementById('valortotalRecebidoField').value = formatNumber(parseFloat(valorTotal));

    // Verifica os checkboxes
    const entreguesEmConformidade = document.getElementById('Conformidade1').checked ? 'Sim' : 'Não';
    const trocaDeMarca = document.getElementById('trocademarca1').checked ? 'Sim' : 'Não';

    // Cria uma nova linha na tabela
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${dtrecebimento}</td>
        <td>${Nnota}</td>
        <td>${codigoRecebido}</td>
        <td>${descricaoRecebido}</td>
        <td>${apresentacaoRecebido}</td>
        <td>${marcaRecebido}</td>
        <td>${quantidadeRecebida}</td>
        <td>${formatNumber(parseNumber(valorUnitario))}</td>
        <td>${formatNumber(parseFloat(valorTotal))}</td>
        <td>${entreguesEmConformidade}</td>
        <td>${trocaDeMarca}</td>
        <td><button class="deleteButton">Deletar</button></td>
    `;

    // Adiciona a nova linha ao corpo da tabela
    document.querySelector('#recebidosTable tbody').appendChild(newRow);

    // Adiciona evento ao botão "Deletar" para remover a linha
    newRow.querySelector('.deleteButton').addEventListener('click', function () {
        newRow.remove();
    });

    // Limpa os campos do formulário após a adição
    form.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    
    // Função para formatar valores com pontos e vírgulas no estilo brasileiro
    const formatarValorBRL = (valor) => {
        return valor.toFixed(2) // Garante duas casas decimais
                    .replace('.', ',') // Substitui ponto por vírgula para casas decimais
                    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona pontos para os milhares
    };

    // Função para preencher a tabela com os itens recebidos
    const preencherTabela = (itensRecebidos) => {
        const tabelaRecebidos = document.querySelector('#recebidosTable tbody');
        tabelaRecebidos.innerHTML = ''; // Limpa a tabela antes de preencher

        itensRecebidos.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.dtrecebimento}</td>
                <td>${item.Nnota}</td>
                <td>${item.codigo}</td>
                <td>${item.descricao}</td>
                <td>${item.apresentacao}</td>
                <td>${item.marca}</td>
                <td>${item.qtdRecebida}</td>
                <td>R$ ${formatarValorBRL(item.valorUnitario)}</td>
                <td>R$ ${formatarValorBRL(item.valorTotal)}</td>
                <td>${item.entregueNosConformes}</td>
                <td>${item.cartaDeTroca}</td>
            `;
            tabelaRecebidos.appendChild(row);
        });
    };

    // Função para buscar os dados da ordem de compra
    const buscarOrdemCompra = (empenho) => {
        fetch(`/api/ordem-compra/${empenho}`)
            .then(response => response.json())
            .then(ordemCompra => {
                if (ordemCompra && ordemCompra.itensrecebidos) {
                    preencherTabela(ordemCompra.itensrecebidos);
                } else {
                    alert('Não há itens recebidos para esta ordem de compra.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar ordem de compra:', error);
                alert('Erro ao buscar ordem de compra.');
            });
    };

    // Obter o número do empenho de algum campo ou variável
    const empenhoField = document.getElementById('empenhoField').value;

    // Chamar a função para buscar os dados da ordem de compra ao carregar a página
    if (empenhoField) {
        buscarOrdemCompra(empenhoField);
    }
});
// Função para validar e formatar a data
function formatarData(dataString) {
    const partes = dataString.split('/');
    if (partes.length === 3) {
        const [d, m, a] = partes.map(Number);
        const data = new Date(a, m - 1, d);
        if (data.getDate() === d && data.getMonth() === m - 1 && data.getFullYear() === a) {
            return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`;
        }
    }
    return null;
}

// Função para salvar o histórico
async function salvarHistorico() {
    const statusField = document.getElementById('statusField');
    const dataField = new Date().toLocaleDateString('pt-BR'); // Data atual
    const horaField = new Date().toLocaleTimeString('pt-BR', { hour12: false }); // Hora atual

    const usuario = 'Usuario Exemplo'; // Substitua pelo usuário atual, se disponível

    const historicoData = {
        user: usuario,
        status: statusField.value,
        data: dataField,
        hora: horaField
    };

    try {
        const response = await fetch(`/api/ordem-compra/${ordemCompraId}/historico`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(historicoData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Histórico salvo com sucesso:', result);
            // Atualize a tabela de históricos aqui, se necessário
        } else {
            console.error('Erro ao salvar histórico:', response.statusText);
            const errorResponse = await response.json();
            console.error('Detalhes do erro:', errorResponse);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
    }
}

// Adicionando evento ao botão "Salvar"
document.getElementById('salvarButton').addEventListener('click', salvarHistorico);

// Função para adicionar eventos de formatação de data
const dataFields = [
    'dtEmpenhoField',
    'dtRecebimentoFornecedorField',
    'dtNotificacaoField',
    'dtagendamentoField',
    'dtrecebimento'
];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('backButton').addEventListener('click', () => {
        // Redireciona para a página home.html na pasta anterior
        window.location.href = '../home.html';
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading');
    
    // Exibe a tela de loading e oculta após 1 segundo
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 1000);
});
async function atualizarTabela(empenho) {
    try {
        console.log(`Buscando logs para o empenho: ${empenho}`); // Log para depuração
        const response = await fetch(`/api/logs/${empenho}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar logs: ${response.status} ${response.statusText}`);
        }

        const logs = await response.json();
        const historicosTable = document.getElementById('historicosTable');

        logs.forEach(log => {
            const row = historicosTable.insertRow();

            const usuarioCell = row.insertCell(0);
            const dataCell = row.insertCell(1);
            const horaCell = row.insertCell(2);
            const movimentacaoCell = row.insertCell(3);

            usuarioCell.textContent = log.responsavel;
            dataCell.textContent = log.dataHora.split(' ')[0]; // Obter apenas a data
            horaCell.textContent = log.dataHora.split(' ')[1]; // Obter apenas a hora
            movimentacaoCell.textContent = log.status;
        });
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const empenho = document.getElementById('empenhoField').value;

    // Se o campo 'empenhoField' estiver vazio, defina um valor padrão
    if (!empenho) {
        // Defina um valor padrão, se necessário
        // Exemplo: const empenho = 'default_value';
        console.warn('Campo de empenho vazio. Certifique-se de que o campo contém um valor válido.');
        return; // Saia da função se não houver valor
    }

    // Adicionando um delay de 1 segundo antes de atualizar a tabela
    setTimeout(async () => {
        await atualizarTabela(empenho);
    }, 1000);
    setTimeout(async () => {
        await atualizarComentariosTabela(empenho);
    }, 1000);
});
document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading');

    // Exibe a tela de loading e oculta após 1 segundo
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
        atualizarTabela('seuEmpenho'); // Chame a função com o empenho real
    }, 1000);
});

async function atualizarTabela(empenho) {
    try {
        console.log(`Buscando logs para o empenho: ${empenho}`);
        const response = await fetch(`/api/logs/${empenho}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar logs: ${response.status} ${response.statusText}`);
        }

        const logs = await response.json();
        console.log(logs); // Inspecione os dados recebidos

        const historicosTable = document.getElementById('historicosTable');

        logs.forEach(log => {
            const row = historicosTable.insertRow();

            const usuarioCell = row.insertCell(0);
            const dataCell = row.insertCell(1);
            const horaCell = row.insertCell(2);
            const movimentacaoCell = row.insertCell(3);

            usuarioCell.textContent = log.responsavel;
            movimentacaoCell.textContent = log.status;

            if (log.dataHora) { // Verifique se dataHora está definido
                const dataHora = log.dataHora.replace(',', '');
                dataCell.textContent = dataHora.split(' ')[0];
                horaCell.textContent = dataHora.split(' ')[1];
            } else {
                dataCell.textContent = 'N/A';
                horaCell.textContent = 'N/A';
            }
        });
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
    }
}

// Função para atualizar a tabela com os comentários
async function atualizarComentariosTabela(empenho) {
    try {
        const response = await fetch(`/api/comentarios/${empenho}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar comentários: ${response.status} ${response.statusText}`);
        }

        const logs = await response.json();
        const comentariosTableBody = document.getElementById('ComentariosTable').getElementsByTagName('tbody')[0];

        logs.forEach(log => {
            const row = comentariosTableBody.insertRow();

            const usuarioCell = row.insertCell(0);
            const empenhoCell  = row.insertCell(1);
            const comentarioCell = row.insertCell(2);
            const dataHoraCell = row.insertCell(3);

            usuarioCell.textContent = log.user; // Ajuste aqui
            empenhoCell.textContent = log.empenho; // Ajuste aqui
            comentarioCell.textContent = log.novoComentario; // Ajuste aqui
            
            // Converte a data do formato 'dd/mm/yyyy hh:mm:ss' para um objeto Date
            const dataHoraParts = log.datahora.split(', ');
            const [dia, mes, ano] = dataHoraParts[0].split('/');
            const [hora, minuto, segundo] = dataHoraParts[1].split(':');
            const formattedDate = new Date(ano, mes - 1, dia, hora, minuto, segundo);
            
            dataHoraCell.textContent = formattedDate.toLocaleString('pt-BR'); // Formatação da data
        });
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
    }
}

// Adicionando o evento de input para atualizar a tabela de comentários
document.addEventListener('DOMContentLoaded', () => {
    const empenhoField = document.getElementById('empenhoField');

    empenhoField.addEventListener('input', () => {
        const empenho = empenhoField.value;
        if (empenho) {
            // Delay de 1 segundo antes de atualizar a tabela
            setTimeout(() => {
                atualizarComentariosTabela(empenho);
            }, 1000);
        }
    });
});