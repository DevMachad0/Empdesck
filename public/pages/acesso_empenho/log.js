
// Evento para adicionar um novo comentário na tabela
document.getElementById('addcomentButton').addEventListener('click', () => {
    const now = new Date();
    const dataHora = now.toLocaleString('pt-BR');

    const user = document.getElementById('responsavelField').value;
    const empenho = document.getElementById('empenhoField').value;
    const comentario = document.getElementById('comentariosField').value;

    const dadosComentario = {
        user: user,
        novoComentario: comentario,
        empenho: empenho,
        datahora: dataHora
    };

    addComentarioToTable(dadosComentario);
    document.getElementById('comentariosField').value = '';
});

// Função para adicionar um comentário à tabela
function addComentarioToTable(comentarios) {
    const tableBody = document.getElementById('ComentariosTable').getElementsByTagName('tbody')[0];

    const newRow = tableBody.insertRow();
    const userCell = newRow.insertCell(0);
    const empenhoCell = newRow.insertCell(1);
    const comentarioCell = newRow.insertCell(2);
    const dataHoraCell = newRow.insertCell(3);

    userCell.textContent = comentarios.user;
    empenhoCell.textContent = comentarios.empenho;
    comentarioCell.textContent = comentarios.novoComentario;
    dataHoraCell.textContent = comentarios.datahora;
}
document.addEventListener('DOMContentLoaded', function() {
    function ocultarColunaEmpenho() {
        const table = document.getElementById('ComentariosTable');
        const rows = table.rows;

        for (let i = 0; i < rows.length; i++) {
            const cell = rows[i].cells[1]; // Índice 1 é a coluna "Empenho"
            if (cell) {
                cell.classList.add('hidden-column'); // Adiciona a classe para ocultar
            }
        }
    }

    ocultarColunaEmpenho();
});
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Desmarca outros checkboxes na mesma checklist
                this.closest('.checklist').querySelectorAll('input[type="checkbox"]').forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
            }
        });
    });
    document.getElementById('codigoRecebidoField').addEventListener('blur', function() {
        const codigoField = this;
        const codigoRecebido = codigoField.value;
        const tabela = document.getElementById('itemsTable');
        const linhas = tabela.getElementsByTagName('tr');
        let codigoValido = false;
    
        // Verifica se o código está presente na tabela
        for (let i = 1; i < linhas.length; i++) { // Começa de 1 para ignorar o cabeçalho
            const codigoItem = linhas[i].getElementsByTagName('td')[0].textContent;
            if (codigoItem === codigoRecebido) {
                codigoValido = true;
                break;
            }
        }
    
        // Se o código não for válido, exibe alerta e limpa os campos
        if (!codigoValido) {
            alert('Código inválido! Por favor, insira um código que está presente na tabela.');
            codigoField.value = ''; // Limpa o campo de código
            document.getElementById('descricaoRecebidoField').value = ''; // Limpa o campo de descrição
        }
    });
    document.getElementById('quantidadeRecebidoField').addEventListener('blur', function() {
        const quantidadeField = this;
        const codigoRecebido = document.getElementById('codigoRecebidoField').value;
        const tabelaSolicitada = document.getElementById('itemsTable');
        const tabelaRecebidos = document.getElementById('recebidosTable');
        const linhasSolicitadas = tabelaSolicitada.getElementsByTagName('tr');
        const linhasRecebidos = tabelaRecebidos.getElementsByTagName('tr');

        let quantidadeSolicitada = 0;
        let quantidadeRecebidaTotal = 0;
        let codigoValido = false;

        // Verifica se o código está presente na tabela de itens solicitados
        for (let i = 1; i < linhasSolicitadas.length; i++) {
            const codigoItem = linhasSolicitadas[i].getElementsByTagName('td')[0].textContent;
            if (codigoItem === codigoRecebido) {
                quantidadeSolicitada = parseInt(linhasSolicitadas[i].getElementsByTagName('td')[4].textContent, 10);
                codigoValido = true; // Marca como código válido
                break;
            }
        }

        // Se o código não for válido, exibe alerta e limpa o campo
        if (!codigoValido) {
            alert('Código inválido! Por favor, insira um código que está presente na tabela de itens solicitados.');
            quantidadeField.value = ''; // Limpa o campo
            return; // Sai da função
        }

        // Verifica a quantidade já recebida na tabela de itens recebidos
        for (let i = 1; i < linhasRecebidos.length; i++) {
            const codigoItem = linhasRecebidos[i].getElementsByTagName('td')[2].textContent; // Índice 2 para Código
            if (codigoItem === codigoRecebido) {
                quantidadeRecebidaTotal += parseInt(linhasRecebidos[i].getElementsByTagName('td')[6].textContent, 10); // Índice 6 para Qtd Recebida
            }
        }

        // Calcular a quantidade restante que pode ser recebida
        const quantidadeMaximaPermitida = quantidadeSolicitada - quantidadeRecebidaTotal;

        // Se a quantidade recebida for superior à quantidade permitida, exibe alerta e limpa o campo
        const quantidadeRecebida = parseInt(quantidadeField.value, 10);
        if (quantidadeRecebida > quantidadeMaximaPermitida) {
            alert(`Quantidade recebida não pode ser superior a ${quantidadeMaximaPermitida}.`);
            quantidadeField.value = ''; // Limpa o campo
        }
    });
// Abre o novo modal ao clicar no botão "Consultaritem"
document.getElementById("Consultaritem").onclick = function() {
    document.getElementById("modal-consultar").style.display = "block";
}

// Fecha o novo modal ao clicar no "X"
document.getElementById("close-modal-consultar").onclick = function() {
    document.getElementById("modal-consultar").style.display = "none";
}

// Lógica para a ação do botão de pesquisa no novo modal
document.getElementById("search-button-consultar").onclick = async function() {
    const input = document.getElementById("search-input-consultar").value;
    const tbody = document.getElementById("result-table-body-consultar");

    // Limpar resultados anteriores
    tbody.innerHTML = "";
    // Verificação para garantir que o input tenha pelo menos 3 caracteres
    if (input.length < 3) {
        alert("Por favor, digite pelo menos 3 caracteres para realizar a pesquisa.");
        return; // Interrompe a execução da função
    }
    if (input) {
        try {
            const response = await fetch(`/api/items/search?q=${encodeURIComponent(input)}`);
            const items = await response.json();

            if (items.length > 0) {
                items.forEach(item => {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${item.codigo}</td><td>${item.descricao}</td>`;
                    
                    // Adiciona evento de clique à linha
                    row.onclick = function() {
                        // Verifica se o item está na tabela de itens
                        const itemsTable = document.getElementById("itemsTable");
                        const existingRows = itemsTable.getElementsByTagName("tr");
                        let itemExists = false;

                        // Itera sobre as linhas da tabela para verificar a existência do item
                        for (let i = 1; i < existingRows.length; i++) { // Começa em 1 para ignorar o cabeçalho
                            const cells = existingRows[i].getElementsByTagName("td");
                            if (cells.length >= 2) {
                                const codigoItem = cells[0].innerText;
                                const descricaoItem = cells[1].innerText;

                                // Compara os códigos e descrições
                                if (codigoItem === item.codigo && descricaoItem === item.descricao) {
                                    itemExists = true;
                                    break;
                                }
                            }
                        }

                        // Preenche os campos apenas se o item existe na tabela
                        if (itemExists) {
                            document.getElementById("codigoRecebidoField").value = item.codigo;
                            document.getElementById("descricaoRecebidoField").value = item.descricao;
                            document.getElementById("modal-consultar").style.display = "none"; // Opcional: fechar o modal
                        } else {
                            alert("O item não está presente na tabela de itens.");
                        }
                    };

                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="2">Nenhum item encontrado.</td></tr>`;
            }
        } catch (error) {
            alert('Erro ao buscar itens: ' + error.message);
        }
    } else {
        alert("Por favor, digite algo para pesquisar.");
    }
}
