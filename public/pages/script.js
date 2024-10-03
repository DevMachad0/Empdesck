// Função para verificar o conteúdo do XPath e redirecionar após 3 tentativas se necessário
function checkUserNameXPath() {
    const maxRetries = 3; // Número máximo de tentativas
    let retries = 0;

    function tryCheck() {
        const username = getValueFromXPath('//*[@id="userName"]');
        
        if (username === '.') {
            retries++;
            if (retries >= maxRetries) {
                // Exibe mensagem de erro e redireciona após 3 tentativas
                alert('Erro de credencial: não foi feito login corretamente.');
                window.location.href = '../index.html'; // Redireciona para a página de login
            } else {
                // Tenta novamente após um pequeno atraso
                setTimeout(tryCheck, 1000); // Aguarda 1 segundo antes de tentar novamente
            }
        }
    }

    // Inicia a verificação
    tryCheck();
}

// Chama a função para verificar o conteúdo do XPath
checkUserNameXPath();
// Função para obter parâmetros da URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        username: params.get('username')
    };
}

// Função para atualizar o campo userName com o valor do savedUsername
function updateUsernameField() {
    const usernameField = document.getElementById('userName');
    if (usernameField) {
        usernameField.textContent = localStorage.getItem('savedUsername') || '.'; // Define um valor padrão caso não haja username
    } else {
        console.error('Elemento com ID userName não encontrado.');
    }
}

// Função para definir o valor de savedUsername a partir da URL e armazenar no localStorage
function setUsernameFromURL() {
    const queryParams = getQueryParams();
    if (queryParams.username) {
        localStorage.setItem('savedUsername', queryParams.username); // Armazena o username no localStorage
    }
    updateUsernameField(); // Atualiza o campo na página
}

// Função para obter o valor de um elemento com base em um XPath
function getValueFromXPath(xpath) {
    const evaluator = new XPathEvaluator();
    const result = evaluator.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const node = result.singleNodeValue;
    return node ? node.textContent.trim() : '';
}

// Função para alternar o estado da sidebar com animação
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Event listeners para o botão de alternância da sidebar
document.getElementById('toggle-btn').addEventListener('click', toggleSidebar);

// Função para carregar uma página no main-content
function loadPage(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar a página: ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(error => {
            console.error('Erro ao carregar o conteúdo:', error);
            document.getElementById('main-content').innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
        });
}

// Event listeners para os links do menu
document.addEventListener('DOMContentLoaded', () => {
    setUsernameFromURL(); // Define o username ao carregar a página

    const links = document.querySelectorAll('.sidebar-nav a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.id.replace('-link', '-content');
            const targetContent = document.getElementById(targetId);

            // Ocultar todos os conteúdos
            document.querySelectorAll('.page-content').forEach(content => {
                content.classList.remove('active');
            });

            // Mostrar o conteúdo correspondente
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Exibir o conteúdo inicial ao carregar a página
    document.getElementById('home-link').click(); // Simula o clique no link inicial
});

document.getElementById("home-link").addEventListener("click", function(event) {
    event.preventDefault(); // Previne o comportamento padrão do link

    // Conteúdo atualizado para incluir botões com número de empenho
    const homeContent = `
        <div class="page-content" id="home-content">
            <h1>Empenho</h1>
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="Pesquisar...">
                <p id="totalRecords">Total: 0 registros</p>
            </div>
            <div class="table-container">
                <table id="ocTable">
                    <thead>
                        <tr>
                            <th>Empenho</th>
                            <th>Fornecedor</th>
                            <th>Status</th>
                            <th>Prioridade</th>
                            <th>Projeto</th>
                            <th>Valor Total</th>
                            <th>Responsável</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Dados da tabela serão inseridos aqui -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Carrega o conteúdo na div main-content
    document.getElementById("main-content").innerHTML = homeContent;

    // Reaplica o script necessário para a nova tabela
    loadTableScripts();
});

// Define as cores para cada status com base no seu mapeamento
const statusColors = {
    'Emitido': '#00f', // Azul, frio
    'Aguardando Agendamento': '#4b8bbE', // Azul claro
    'Agendado Parcial': '#007bff', // Azul
    'Entregue Parcial': '#00bfff', // Azul claro
    'Agendado Total': '#32cd32', // Verde limão
    'Entregue Total': '#00ff00', // Verde
    'Pendência Fornecedor': '#ffff00', // Amarelo
    'Entregue ao Financeiro': '#b3a700', // Amarelo ouro
    'Empenho Pago': '#0AE302', 
    'Empenho Cancelado': '#ff0000' // Vermelho, quente
};
const prioridadeColors = {
    'Zero': '#000000', 
    'zero': '#000000', 
    'Crítica': '#e00000', 
    'crítica': '#e00000',
    'critica': '#e00000',
    'Alta': '#ff8000', 
    'alta': '#ff8000', 
    'Média': '#c9b904', 
    'média': '#c9b904', 
    'media': '#c9b904',
    'Baixa': '#0364ad',
    'baixa': '#0364ad' 
};
// Função para carregar dados na tabela
function loadTableScripts() {
    fetch('/api/ordens-de-compra')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar dados: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#ocTable tbody');
            tableBody.innerHTML = ''; // Limpar o conteúdo existente

            data.forEach(oc => {
                const row = document.createElement('tr');

                // Cria uma célula de botão para o número do empenho
                const empenhoCell = document.createElement('td');
                const empenhoButton = document.createElement('button');
                empenhoButton.textContent = oc.empenho || '';
                empenhoButton.className = 'empenho-btn';
                empenhoButton.addEventListener('click', () => {
                    console.log(empenhoButton.textContent);
                    loadOrderDetails(empenhoButton.textContent);
                });
                empenhoCell.appendChild(empenhoButton);

                // Calcula o valor total a partir dos itens
                const valorTotal = oc.itens.reduce((total, item) => total + parseFloat(item.valorTotal || 0), 0);
                const valorTotalFormatted = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                // Cria uma célula para o status com estilo de botão
                const statusCell = document.createElement('td');
                const statusButton = document.createElement('div');
                statusButton.textContent = oc.status || '';
                const color = statusColors[oc.status] || '#CCCCCC'; // Cor padrão se o status não estiver no objeto
                statusButton.style.backgroundColor = color;
                statusButton.style.color = '#FFFFFF'; // Cor do texto para contraste
                statusButton.style.borderRadius = '5px'; // Bordas arredondadas
                statusButton.style.fontWeight = 'bold'; // Texto em negrito
                statusButton.style.padding = '10px 15px'; // Padding interno
                statusButton.style.display = 'inline-block'; // Faz o botão se comportar como bloco inline
                statusButton.style.width = '100%'; // Ocupa toda a largura disponível na célula
                statusButton.style.boxSizing = 'border-box'; // Inclui padding e borda na largura total
                statusButton.style.textAlign = 'center'; // Centraliza o texto horizontalmente
                statusButton.style.cursor = 'pointer'; // Aparece como cursor de botão

                statusCell.style.textAlign = 'center'; // Centraliza a célula horizontalmente
                statusCell.style.verticalAlign = 'middle'; // Centraliza a célula verticalmente
                statusCell.appendChild(statusButton); // Adiciona o botão de status à célula
                // Cria uma célula para a prioridade com estilo de botão
                const prioridadeCell = document.createElement('td');
                const prioridadeButton = document.createElement('div');
                prioridadeButton.textContent = oc.prioridade || '';
                const prioridadeColor = prioridadeColors[oc.prioridade] || '#CCCCCC'; // Cor padrão se a prioridade não estiver no objeto
                prioridadeButton.style.backgroundColor = prioridadeColor;
                prioridadeButton.style.color = '#FFFFFF'; // Cor do texto para contraste
                prioridadeButton.style.borderRadius = '5px'; // Bordas arredondadas
                prioridadeButton.style.fontWeight = 'bold'; // Texto em negrito
                prioridadeButton.style.padding = '10px 15px'; // Padding interno
                prioridadeButton.style.display = 'inline-block'; // Comportamento de bloco inline
                prioridadeButton.style.width = '100%'; // Ocupa toda a largura disponível na célula
                prioridadeButton.style.boxSizing = 'border-box'; // Inclui padding e borda na largura total
                prioridadeButton.style.textAlign = 'center'; // Centraliza o texto horizontalmente
                prioridadeButton.style.cursor = 'pointer'; // Aparece como cursor de botão

                prioridadeCell.style.textAlign = 'center'; // Centraliza a célula horizontalmente
                prioridadeCell.style.verticalAlign = 'middle'; // Centraliza a célula verticalmente
                prioridadeCell.appendChild(prioridadeButton); // Adiciona o botão de prioridade à célula
                // Adiciona as outras células
                row.appendChild(empenhoCell);
                row.appendChild(createCell(oc.fornecedor));
                row.appendChild(statusCell); // Adiciona a célula do status
                row.appendChild(prioridadeCell);
                row.appendChild(createCell(oc.projeto));
                row.appendChild(createCell(valorTotalFormatted)); // Adiciona o valor total formatado
                row.appendChild(createCell(oc.responsavel));

                tableBody.appendChild(row);
            });

            updateTotalRecords(data);
            initializeFilter();
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);
        });
};

// Função auxiliar para criar células de tabela
function createCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content || '';
    return cell;
}

// Função para atualizar o total de registros visíveis
function updateTotalRecords(data) {
    const totalRecords = data.length;
    document.getElementById('totalRecords').textContent = `Total: ${totalRecords} registros`;
}

// Função para inicializar o filtro de pesquisa
function initializeFilter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterTable);

    document.getElementById('pesquisaBtn').addEventListener('click', filterTable);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        searchInput.value = ''; // Limpa o campo de pesquisa
        filterTable(); // Reaplica o filtro para mostrar todas as linhas
    });

    // Inicializa o filtro para exibir todos os registros
    filterTable();
}

// Função para filtrar a tabela com base no texto de pesquisa
function filterTable() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#ocTable tbody tr');

    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let match = false;

        // Verifica se qualquer célula contém o texto de pesquisa
        cells.forEach(cell => {
            if (cell.textContent.toLowerCase().includes(searchInput)) {
                match = true;
            }
        });

        // Exibe ou oculta a linha com base na correspondência
        row.style.display = (searchInput === '' || match) ? '' : 'none';
    });

    // Atualiza o total de registros após o filtro
    updateTotalRecords(Array.from(tableRows).filter(row => row.style.display !== 'none'));
}

// Função para carregar detalhes da ordem de compra
function loadOrderDetails(empenho) {
    fetch(`/api/ordemcompraS/${empenho}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar detalhes da ordem de compra: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Obter o valor do responsável usando XPath
            const responsavelFromXPath = getValueFromXPath('//*[@id="userName"]'); // Atualize o XPath conforme necessário

            // Redireciona para a página com parâmetros na URL
            const ordemCompra = data.ordemCompra;
            const nup = data.nup;
            const fornecedor = data.fornecedor;
            const arpContratoPregao = data.arpContratoPregao;
            const dtEmpenho = data.dtEmpenho;
            const dtRecebimentoFornecedor = data.dtRecebimentoFornecedor;
            const projeto = data.projeto;
            const prioridade = data.prioridade;
            const dtNotificacao = data.dtNotificacao;
            const informacoesCopla = data.informacoesCopla;
            const dtRecebimentoCd = data.dtRecebimentoCd;
            const dtagendamento = data.dtagendamento;
            const notificacao = data.notificacao;
            const observacoes = data.observacoes;
            const status = data.status;
            const responsavel = responsavelFromXPath; // Usar o valor obtido pelo XPath
            const itens = data.itens; // Supondo que 'itens' é um array

            window.location.href = `acesso_empenho/index.html?displayEmpenho=${encodeURIComponent(empenho)}&displayOrdemCompra=${encodeURIComponent(ordemCompra)}&displayNup=${encodeURIComponent(nup)}&displaydtagendamento=${encodeURIComponent(dtagendamento)}&displayFornecedor=${encodeURIComponent(fornecedor)}&displayArpContratoPregao=${encodeURIComponent(arpContratoPregao)}&displayDtEmpenho=${encodeURIComponent(dtEmpenho)}&displayDtRecebimentoFornecedor=${encodeURIComponent(dtRecebimentoFornecedor)}&displayProjeto=${encodeURIComponent(projeto)}&displayPrioridade=${encodeURIComponent(prioridade)}&displayDtNotificacao=${encodeURIComponent(dtNotificacao)}&displayInformacoesCopla=${encodeURIComponent(informacoesCopla)}&displayNotificacao=${encodeURIComponent(notificacao)}&displayObservacoes=${encodeURIComponent(observacoes)}&displayStatus=${encodeURIComponent(status)}&displayResponsavel=${encodeURIComponent(responsavel)}&itens=${encodeURIComponent(JSON.stringify(itens))}`;
        })
        .catch(error => {
            console.error('Erro ao carregar detalhes da ordem de compra:', error);
        });
}
document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading');
    
    // Exibe a tela de loading e oculta após 1 segundo
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 1000);
});
function sair() {
    window.location.href = '../index.html';
}