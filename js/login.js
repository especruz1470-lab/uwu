document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            // Prevenimos que el formulario se envíe de la forma tradicional.
            e.preventDefault();

            // Ocultamos cualquier error previo.
            errorMessage.style.display = 'none';

            // Obtenemos los valores del formulario.
            const username = document.getElementById('user').value;
            const password = document.getElementById('pass').value;

            try {
                // Hacemos la petición a nuestra API en PHP.
                const response = await fetch('../php/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: username, password: password })
                });

                const result = await response.json();

                if (result.success) {
                    // Si el login es exitoso, redirigimos a la página principal.
                    window.location.href = 'Principal.html';
                } else {
                    // Si hay un error, lo mostramos.
                    errorMessage.textContent = result.message || 'Error al iniciar sesión.';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                errorMessage.textContent = 'Error de conexión con el servidor.';
                errorMessage.style.display = 'block';
            }
        });
    }
});