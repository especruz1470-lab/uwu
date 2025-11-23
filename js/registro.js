document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registro-form');
    const messageContainer = document.getElementById('message-container');

    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitamos el envío tradicional del formulario

            // Limpiamos mensajes anteriores
            messageContainer.innerHTML = '';
            messageContainer.className = '';

            // Obtenemos los datos del formulario
            const fullname = document.getElementById('fullname').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const birthdate = document.getElementById('birthdate').value;

            // --- Validación del lado del cliente ---
            if (!fullname || !username || !email || !password || !birthdate) {
                showMessage('Todos los campos son obligatorios.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Las contraseñas no coinciden.', 'error');
                return;
            }

            // Preparamos los datos para enviar
            const userData = { fullname, username, email, password, birthdate };

            try {
                // Hacemos la petición a nuestra API de registro
                const response = await fetch('../php/registro.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                // Clonamos la respuesta para poder leerla dos veces (una como JSON, otra como texto si falla)
                const responseClone = response.clone();

                try {
                    const result = await response.json();

                    if (result.success) {
                        showMessage(result.message, 'success');
                        // Opcional: redirigir al login después de unos segundos
                        setTimeout(() => {
                            window.location.href = 'InicioSesion.html';
                        }, 2000);
                    } else {
                        showMessage(result.message || 'Ocurrió un error.', 'error');
                    }
                } catch (jsonError) {
                    // Si falla el .json(), es porque PHP devolvió un error de texto plano.
                    console.error('Error al procesar la respuesta JSON:', jsonError);
                    const errorText = await responseClone.text();
                    showMessage('Error del servidor. Revisa la consola para más detalles.', 'error');
                    console.error('Respuesta del servidor (no es JSON):', errorText);
                }

            } catch (error) {
                showMessage('Error de conexión con el servidor.', 'error');
            }
        });
    }

    function showMessage(message, type) {
        messageContainer.textContent = message;
        messageContainer.className = `message-box ${type}`; // 'message-box success' o 'message-box error'
        messageContainer.style.display = 'block';
    }
});