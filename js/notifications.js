/**
 * Inicializa el sistema de notificaciones de amistad.
 * Carga las solicitudes pendientes y configura los listeners.
 */
async function initializeNotifications() {
  const notifIcon = document.querySelector('.notification-icon');
  const notifDropdown = document.querySelector('.notification-dropdown');
  const notifCount = document.querySelector('.notification-count');

  if (!notifIcon || !notifDropdown || !notifCount) return;

  // Cargar notificaciones al iniciar
  await loadFriendRequests();

  notifIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target)) {
      notifDropdown.classList.remove('show');
    }
  });

  notifDropdown.addEventListener('click', handleNotificationAction);

  async function loadFriendRequests() {
    try {
      const response = await fetch('../php/get_friend_requests.php');
      const data = await response.json();

      if (data.success && data.requests.length > 0) {
        notifCount.textContent = data.requests.length;
        notifCount.style.display = 'block';
        notifDropdown.innerHTML = data.requests.map(req => `
          <div class="notification-item" data-request-id="${req.idSolicitud}">
            <p><strong>${req.nomUsuarioSolicitante}</strong> te envió una solicitud de amistad.</p>
            <div class="notification-actions">
              <button class="btn-accept">Aceptar</button>
              <button class="btn-decline">Rechazar</button>
            </div>
          </div>
        `).join('');
      } else {
        notifCount.style.display = 'none';
        notifDropdown.innerHTML = '<div class="notification-item"><p>No tienes notificaciones.</p></div>';
      }
    } catch (error) {
      console.error('Error al cargar solicitudes de amistad:', error);
      notifDropdown.innerHTML = '<div class="notification-item"><p>Error al cargar notificaciones.</p></div>';
    }
  }

  async function handleNotificationAction(e) {
    const target = e.target;
    const action = target.classList.contains('btn-accept') ? 'accept' : (target.classList.contains('btn-decline') ? 'decline' : null);
    if (!action) return;

    const item = target.closest('.notification-item');
    const requestId = item.dataset.requestId;

    try {
      const response = await fetch(`../php/handle_friend_request.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action: action })
      });
      const data = await response.json();

      if (data.success) {
        await loadFriendRequests(); // Recargar notificaciones
        // Si existe una función global para recargar la lista de chats, la llamamos
        if (window.chatManager && typeof window.chatManager.loadChatList === 'function') {
          window.chatManager.loadChatList();
        }
      } else {
        alert(data.message || 'Ocurrió un error.');
      }
    } catch (error) {
      console.error('Error al manejar la solicitud:', error);
    }
  }

  // Exponer la función para recargar notificaciones
  return { loadFriendRequests };
}