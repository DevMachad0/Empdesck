// Definindo a variável global para armazenar o username
let savedUsername = '';

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Salvando o token e o nome de usuário
            localStorage.setItem('token', result.token);
            savedUsername = username; // Armazena o username na variável global
            // Incluindo o username como parâmetro na URL
            window.location.href = `pages/home.html?username=${encodeURIComponent(username)}`; // Redireciona para a página principal
        } else {
            document.getElementById('error-message').innerText = result.message;
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('error-message').innerText = 'Ocorreu um erro. Tente novamente.';
    }
});
