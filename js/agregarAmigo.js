document.addEventListener("DOMContentLoaded", async () => {
  let currentUserId = null;
  let currentUserAvatar = '../Assets/Profile.png';

  // Inicializamos los módulos comunes
  await loadCurrentUserData();
  window.notificationManager = await initializeNotifications();
  window.chatManager = initializeChat({
    chatListContainerId: 'chat-list-container',
    mainChatSectionId: 'chat-section-main',
    pageContentSectionId: 'agregar-amigo-container', // ID del contenido principal de esta página
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

  const mainContainer = document.getElementById('agregar-amigo-container');
  const sendFriendRequest = async (e) => {
    // Solo actuar si se hizo clic en un botón de "Agregar Amigo" que no esté deshabilitado
    if (!e.target.classList.contains('add-friend-btn') || e.target.disabled) {
      return;
    }

    // Encontrar el contenedor del item (ya sea .suggestion-item o .result-item)
    const itemContainer = e.target.closest('[data-user-id]');
    if (!itemContainer) return;

    const userId = itemContainer.dataset.userId;
    const button = e.target;

    try {
      const response = await fetch('../php/send_friend_request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receptor_id: userId })
      });
      const data = await response.json();

      if (data.success) {
        button.textContent = 'Solicitud Enviada';
        button.disabled = true;
      } else {
        alert(data.message || 'No se pudo enviar la solicitud.');
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Error de conexión al enviar la solicitud.');
    }
  };

  let allSuggestions = []; // Almacenará todas las sugerencias cargadas
  const suggestionsList = document.getElementById('suggestions-list');
  const searchInput = document.querySelector('.search-input');

  /**
   * Renderiza la lista de usuarios en el contenedor de sugerencias.
   * @param {Array} usersToRender - El array de usuarios a mostrar.
   */
  function renderSuggestions(usersToRender) {
    if (!suggestionsList) return;

    if (usersToRender.length > 0) {
      suggestionsList.innerHTML = ''; // Limpiar la lista
      usersToRender.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'suggestion-item';
        userElement.dataset.userId = user.idUsuario;

        const buttonText = user.solicitud_pendiente ? 'Solicitud Enviada' : 'Agregar Amigo';
        const buttonDisabled = user.solicitud_pendiente ? 'disabled' : '';

        userElement.innerHTML = `
          <div class="suggestion-info">
            <img src="${user.fotoPerfil ? '../' + user.fotoPerfil : '../Assets/Profile.png'}" alt="Avatar" class="suggestion-avatar">
            <span class="suggestion-name">${user.nomUsuario}</span>
          </div>
          <button class="add-friend-btn" ${buttonDisabled}>${buttonText}</button>
        `;
        suggestionsList.appendChild(userElement);
      });
    } else {
      suggestionsList.innerHTML = '<p class="results-feedback">No se encontraron usuarios con ese nombre.</p>';
    }
  }

  /**
   * Carga la lista de usuarios que no son amigos y la muestra como sugerencias.
   */
  async function loadFriendSuggestions() {
    if (!suggestionsList) return;

    try {
      const response = await fetch('../php/get_non_friends.php');
      const data = await response.json();

      if (data.success) {
        allSuggestions = data.users;
        renderSuggestions(allSuggestions);
      } else {
        allSuggestions = [];
        suggestionsList.innerHTML = '<p class="results-feedback">No hay sugerencias de amistad por el momento.</p>';
      }
    } catch (error) {
      console.error('Error al cargar sugerencias de amistad:', error);
      suggestionsList.innerHTML = '<p class="results-feedback">Error al cargar las sugerencias.</p>';
    }
  }

  /**
   * Filtra la lista de sugerencias basándose en el término de búsqueda.
   */
  function filterSuggestions() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
      renderSuggestions(allSuggestions);
      return;
    }
    const filteredUsers = allSuggestions.filter(user =>
      user.nomUsuario.toLowerCase().includes(searchTerm)
    );
    renderSuggestions(filteredUsers);
  }

  // Cargar las sugerencias al iniciar la página.
  loadFriendSuggestions();

  // --- Asignación de Eventos ---
  if (searchInput) {
    searchInput.addEventListener('input', filterSuggestions);
  }
  if (mainContainer) mainContainer.addEventListener('click', sendFriendRequest);

  console.log("Página de Agregar Amigo cargada correctamente.");
});