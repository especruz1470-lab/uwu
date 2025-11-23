document.addEventListener("DOMContentLoaded", async () => {
  let currentUserId = null;
  let currentUserAvatar = '../Assets/Profile.png'; // Avatar por defecto

  // Inicializamos los módulos comunes
  await loadCurrentUserData();
  window.notificationManager = await initializeNotifications();
  window.chatManager = initializeChat({
    chatListContainerId: 'chat-list-container',
    mainChatSectionId: 'chat-section-main',
    pageContentSectionId: 'crear-grupo-container', // ID del contenido principal de esta página
    currentUserId: currentUserId,
    currentUserAvatar: currentUserAvatar
  });

  /**
   * Carga los datos del usuario con sesión activa desde el servidor.
   */
  async function loadCurrentUserData() {
    try {
      const response = await fetch('../php/get_user_data.php');
      const data = await response.json();

      if (data.success) {
        const user = data.user;
        const userIcon = document.querySelector('.topbar .user-icon');
        const userName = document.querySelector('.topbar .user-info strong');

        if (userIcon) userIcon.src = user.profilePic;
        if (userName) userName.textContent = user.username;
        currentUserAvatar = user.profilePic;
        currentUserId = user.id;
      } else {
        window.location.href = 'InicioSesion.html';
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  // Lógica para el menú desplegable del botón "+" (Agregar Amigo / Crear Grupo)
  const addBtn = document.querySelector(".add-btn");
  const addOptions = document.querySelector(".add-options");

  if (addBtn && addOptions) {
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addOptions.classList.toggle("show");
    });

    addOptions.querySelector(".dropdown-item:nth-child(1)").addEventListener("click", () => {
      window.location.href = "CrearGrupo.html";
      addOptions.classList.remove("show");
    });

    addOptions.querySelector(".dropdown-item:nth-child(2)").addEventListener("click", () => {
      window.location.href = "AgregarAmigo.html";
      addOptions.classList.remove("show");
    });

    document.addEventListener("click", (e) => {
      if (!addOptions.contains(e.target) && e.target !== addBtn) {
        addOptions.classList.remove("show");
      }
    });
  }

  // Lógica para el menú desplegable de 3 puntos (Perfil / Cerrar Sesión)
  const verticalMenu = document.querySelector(".vertical-menu");
  const menuDropdown = document.querySelector(".menu-dropdown");

  if (verticalMenu && menuDropdown) {
    verticalMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle("show");
    });

    menuDropdown.querySelector(".dropdown-item:nth-child(1)").addEventListener("click", () => {
      window.location.href = "Perfil.html";
      menuDropdown.classList.remove("show");
    });

    menuDropdown.querySelector(".dropdown-item:nth-child(2)").addEventListener("click", async () => {
      if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        try {
          const response = await fetch('../php/logout.php', { method: 'POST' });
          const result = await response.json();
          if (result.success) {
            window.location.href = "InicioSesion.html";
          } else {
            alert('Error al cerrar sesión.');
          }
        } catch (error) {
          alert('Error de conexión al cerrar la sesión.');
        }
      }
      menuDropdown.classList.remove("show");
    });

    document.addEventListener("click", () => menuDropdown.classList.remove("show"));
    menuDropdown.addEventListener("click", (e) => e.stopPropagation());
  }

  // Recargar la lista de chats y notificaciones cuando la ventana/pestaña recupera el foco
  window.addEventListener('focus', () => {
    if (window.chatManager) window.chatManager.loadChatList();
    if (window.notificationManager) window.notificationManager.loadFriendRequests();
  });

  console.log("Página de Crear Grupo cargada correctamente.");
});