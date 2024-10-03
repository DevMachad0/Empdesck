document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');

    function loadPage(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                mainContent.innerHTML = html;
                initPageScripts(); // Inicializa os scripts específicos da página carregada
            })
            .catch(error => {
                console.error('Erro ao carregar o conteúdo:', error);
            });
    }

    document.getElementById('cadastrar-oc-link').addEventListener('click', function(e) {
        e.preventDefault();
        loadPage('cadastro_oc/index.html');
    });

    function getUserName() {
        // Usa XPath para buscar o elemento com o id 'userName'
        const xpath = '//*[@id="userName"]';
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const node = result.singleNodeValue;
        return node ? node.textContent.trim() : 'Desconhecido';
    }

    function initPageScripts() {
        const itemForm = document.getElementById('itemForm');
        const ocForm = document.getElementById('ocForm');
        const infoTable = document.getElementById('infoTable')?.getElementsByTagName('tbody')[0];
        const notification = document.getElementById('notification');
        const fornecedorSelect = document.getElementById('fornecedor');
        const itemCodigo = document.getElementById('itemCodigo');
        const itemDescricao = document.getElementById('itemDescricao');

        if (itemForm && ocForm && infoTable && notification && fornecedorSelect) {
            loadFornecedores(fornecedorSelect);

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

            const currencyInputs = document.querySelectorAll('#itemValorUnt, #itemValorTotal');
            currencyInputs.forEach(input => {
                input.addEventListener('input', handleInput);
            });

            function updateItemValorTotal() {
                const itemQtdSolicitada = document.getElementById('itemQtdSolicitada');
                const itemValorUnt = document.getElementById('itemValorUnt');
                const itemValorTotal = document.getElementById('itemValorTotal');

                function handleUpdate() {
                    const qtd = parseFloat(itemQtdSolicitada.value.replace(/[^\d]/g, '')) || 0;
                    const valorUnitario = parseCurrency(itemValorUnt.value) || 0;
                    const valorTotal = qtd * valorUnitario;
                    itemValorTotal.value = formatToCurrency(valorTotal.toFixed(4));
                }

                itemQtdSolicitada.addEventListener('input', handleUpdate);
                itemValorUnt.addEventListener('input', handleUpdate);
            }

            updateItemValorTotal();

            document.getElementById('addItemBtn').addEventListener('click', () => {
                const ocFormData = new FormData(ocForm);
                const itemFormData = new FormData(itemForm);
                
                const newRow = infoTable.insertRow();
                
                const ocFields = ['empenho', 'nup', 'ordemCompra', 'fornecedor', 'arpContratoPregao', 'dtEmpenho', 'dtRecebimentoFornecedor', 'projeto', 'prioridade', 'dtNotificacao', 'informacoesCopla', 'notificacao', 'observacoes'];
                ocFields.forEach(field => {
                    const newCell = newRow.insertCell();
                    newCell.textContent = ocFormData.get(field) || '';
                    newCell.classList.add('hidden-column');
                });

                const itemFields = ['itemCodigo', 'itemDescricao', 'itemApresentacao', 'itemMarca', 'itemQtdSolicitada', 'itemValorUnt', 'itemValorTotal'];
                itemFields.forEach(field => {
                    const newCell = newRow.insertCell();
                    const value = itemFormData.get(field) || '';
                    newCell.textContent = field.includes('Valor') ? formatToCurrency(value) : value;
                });

                const deleteCell = newRow.insertCell();
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Deletar';
                deleteButton.className = 'delete-btn';
                deleteButton.addEventListener('click', () => {
                    infoTable.deleteRow(newRow.rowIndex - 1);
                });
                deleteCell.appendChild(deleteButton);

                itemForm.reset();

                showNotification('Item adicionado com sucesso!');
            });

            document.getElementById('cadastrar').addEventListener('click', async () => {
                const ocFormData = new FormData(ocForm);
                const infoTableRows = infoTable.getElementsByTagName('tr');

                if (infoTableRows.length === 0) {
                    showNotification('Adicione pelo menos um item à tabela antes de cadastrar.');
                    return;
                }

                const itens = [];

                for (let i = 0; i < infoTableRows.length; i++) {
                    const rowCells = infoTableRows[i].getElementsByTagName('td');
                    const item = {
                        codigo: rowCells[13]?.textContent || '',
                        descricao: rowCells[14]?.textContent || '',
                        apresentacao: rowCells[15]?.textContent || '',
                        marca: rowCells[16]?.textContent || '',
                        qtdSolicitada: parseFloat(rowCells[17]?.textContent) || 0,
                        valorUnitario: parseCurrency(rowCells[18]?.textContent) || 0,
                        valorTotal: parseCurrency(rowCells[19]?.textContent) || 0
                    };
                    itens.push(item);
                }

                const ocData = {};
                const ocFields = ['empenho', 'nup', 'ordemCompra', 'fornecedor', 'arpContratoPregao', 'dtEmpenho', 'dtRecebimentoFornecedor', 'projeto', 'dtEnvioFinanceiro', 'prioridade', 'dtAgendamento', 'notaFiscal', 'dtNotificacao', 'entregaConformidade', 'trocaMarca', 'informacoesCopla', 'dtRecebimentoCd', 'notificacao', 'observacoes'];
                ocFields.forEach(field => {
                    ocData[field] = ocFormData.get(field) || '.';
                });

                // Adiciona o  ao campo responsável
                ocData.responsavel = getUserName();

                try {
                    const response = await fetch('/api/cadastrar-oc', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ ocData, itens })
                    });

                    const contentType = response.headers.get('content-type');

                    if (contentType && contentType.includes('application/json')) {
                        const result = await response.json();
                        showNotification(result.message);
                    } else {
                        const errorText = await response.text();
                        console.error('Erro de resposta do servidor:', errorText);
                        showNotification('Erro ao cadastrar OC: ' + errorText);
                    }
                } catch (error) {
                    console.error('Erro ao cadastrar OC:', error);
                    showNotification('Erro ao cadastrar OC');
                }
            });

            function showNotification(message) {
                notification.textContent = message;
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 3000);
            }

            function fetchItemByCodigo(codigo) {
                console.log(`Buscando item com código: ${codigo}`); // Log para depuração
                fetch(`/api/novoItem/${codigo}`)
                    .then(response => response.json())
                    .then(item => {
                        console.log('Resposta da API:', item); // Log para depuração
                        if (item && item.codigo) { // Ajustado para verificar o campo 'codigo'
                            itemDescricao.value = item.descricao; // Preenche o campo com a descrição do item
                        } else {
                            itemDescricao.value = ''; // Limpa o campo se o item não for encontrado
                            showNotification('Item não encontrado.');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao buscar item:', error);
                        showNotification('Erro ao buscar item.');
                    });
            }

            // Adiciona o event listener para o campo itemCodigo
            if (itemCodigo) {
                itemCodigo.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault(); // Previne o comportamento padrão de Enter
                        const codigo = itemCodigo.value.trim(); // Remove espaços extras
                        if (codigo) {
                            fetchItemByCodigo(codigo); // Chama a função para buscar o item
                        } else {
                            showNotification('Digite um código de item válido.');
                        }
                    }
                });
            }
        }
    }

    // Função para carregar e preencher a lista de fornecedores
    function loadFornecedores(selectElement) {
        fetch('/api/buscar-fornecedores')
            .then(response => response.json())
            .then(fornecedores => {
                selectElement.innerHTML = '<option value="">Selecione um fornecedor</option>'; // Adiciona o placeholder
                fornecedores.forEach(fornecedor => {
                    const option = document.createElement('option');
                    option.value = fornecedor.razaoSocial; // Usa o nome do fornecedor como valor
                    option.textContent = fornecedor.razaoSocial; // Exibe o nome do fornecedor
                    selectElement.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar fornecedores:', error);
            });
    }    

    // Inicializa a página inicial
    initPageScripts();
});
