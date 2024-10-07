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

    document.getElementById('preferences-link').addEventListener('click', function(e) {
        e.preventDefault();
        loadPage('config/index.html'); 
    });

    // Função para inicializar os scripts dos formulários de cadastro
    function initPageScripts() {
        // Função para cadastrar um usuário
        const cadastrarUsuarioForm = document.getElementById('cadastrarUsuarioForm');
        if (cadastrarUsuarioForm) {
            cadastrarUsuarioForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const nome = document.getElementById('nome').value;
                const user = document.getElementById('user').value;
                const senha = document.getElementById('senha').value;
                const unidade = document.getElementById('unidade').value;
                const contato = document.getElementById('contato').value;
                const email = document.getElementById('email').value;
                const grupo = document.getElementById('grupo').value;
                const status = document.getElementById('status').value;
                const ocupacao = document.getElementById('ocupacao').value;

                const userData = {
                    nome,
                    user,
                    senha,
                    unidade,
                    contato,
                    email,
                    grupo,
                    status,
                    ocupacao
                };

                fetch('/api/cadastrar-usuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message || 'Usuário cadastrado com sucesso!');
                })
                .catch(error => console.error('Erro ao cadastrar usuário:', error));
            });
        }

        // Função para cadastrar um fornecedor
        const cadastrarFornecedorForm = document.getElementById('cadastrarFornecedorForm');
        if (cadastrarFornecedorForm) {
            cadastrarFornecedorForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const razaoSocial = document.getElementById('razaoSocial').value;
                const nomeFantasia = document.getElementById('nomeFantasia').value;
                const codigoFornecedor = document.getElementById('codigoFornecedor').value;
                const contatoFornecedor = document.getElementById('contatoFornecedor').value;
                const status = document.getElementById('status').value;
                const cnpj = document.getElementById('cnpj').value;

                const fornecedorData = {
                    razaoSocial,
                    nomeFantasia,
                    codigoFornecedor,
                    contatoFornecedor,
                    status,
                    cnpj
                };

                fetch('/api/cadastrar-fornecedor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fornecedorData)
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message || 'Fornecedor cadastrado com sucesso!');
                })
                .catch(error => console.error('Erro ao cadastrar fornecedor:', error));
            });
        }

        // Função para cadastrar um item
        const cadastrarItemForm = document.getElementById('cadastrarItemForm');
        if (cadastrarItemForm) {
            cadastrarItemForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const codigoItem = document.getElementById('codigoItem').value;
                const descricaoItem = document.getElementById('descricaoItem').value;
                const marcaItem = document.getElementById('marcaItem').value;

                const itemData = {
                    codigoItem,
                    descricaoItem,
                    marcaItem
                };

                fetch('/api/cadastrar-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(itemData)
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message || 'Item cadastrado com sucesso!');
                })
                .catch(error => console.error('Erro ao cadastrar item:', error));
            });
        }
    }

    // Inicializa a página inicial
    initPageScripts();
});
