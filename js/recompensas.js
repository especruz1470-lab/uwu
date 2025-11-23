document.addEventListener("DOMContentLoaded", async () => {
  const userData = await loadCurrentUserData();
  if (!userData) return;

  initializeTopbarMenus();

  window.notificationManager = await initializeNotifications();
  window.chatManager = initializeChat({
    chatListContainerId: 'chat-list-container',
    mainChatSectionId: 'chat-section-main',
    pageContentSectionId: 'recompensas-container', // ID del contenido principal de esta página
    currentUserId: userData.id,
    currentUserAvatar: userData.profilePic
  });

  window.addEventListener('focus', () => {
    if (window.chatManager) window.chatManager.loadChatList();
    if (window.notificationManager) window.notificationManager.loadFriendRequests();
  });

  const pointsAmountEl = document.querySelector('.points-amount');
    const copasGrid = document.querySelector('.copas-grid');

    if (!pointsAmountEl || !copasGrid) return;

    // Función para mostrar notificaciones flotantes (toast)
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${isError ? 'error' : ''}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Hacer visible el toast
        setTimeout(() => toast.classList.add('show'), 10);

        // Ocultar y eliminar el toast después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    // Cargar estado inicial (puntos y copas adquiridas)
    async function loadInitialState() {
        try {
            const response = await fetch('../php/get_recompensas_estado.php');
            const data = await response.json();

            if (data.success) {
                // Actualizar puntos
                pointsAmountEl.textContent = `${data.puntos} pts`;

                // Marcar copas ya adquiridas
                document.querySelectorAll('.copa-card').forEach(card => {
                    const copaId = card.dataset.copaId;
                    if (data.copas_adquiridas.includes(copaId)) {
                        const btn = card.querySelector('.comprar-btn');
                        btn.disabled = true;
                        btn.textContent = 'Adquirida';
                        card.classList.add('adquirida');
                    }
                });
            }
        } catch (error) {
            console.error('Error al cargar estado inicial de recompensas:', error);
        }
    }

    copasGrid.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('comprar-btn') || e.target.disabled) {
            return;
        }

        const card = e.target.closest('.copa-card');
        const idCopa = card.dataset.copaId;
        const precio = parseInt(card.dataset.price, 10);

        if (confirm(`¿Seguro que quieres canjear "${card.querySelector('.copa-name').textContent}" por ${precio} puntos?`)) {
            try {
                const response = await fetch('../php/canjear_copa.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_copa: idCopa, precio: precio })
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast(result.message);
                    pointsAmountEl.textContent = `${result.nuevos_puntos} pts`;
                    e.target.disabled = true;
                    e.target.textContent = 'Adquirida';
                    card.classList.add('adquirida');
                } else {
                    showToast(result.message || 'Ocurrió un error.', true);
                }
            } catch (error) {
                showToast('Error de conexión. Inténtalo de nuevo.', true);
            }
        }
    });

    // Cargar todo al iniciar
    loadInitialState();
});