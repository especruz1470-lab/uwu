document.addEventListener("DOMContentLoaded", async () => {
  let currentUserId = null;
  let newProfilePicFile = null; // Variable para guardar el archivo de la nueva foto de perfil
  let currentUserAvatar = '../Assets/Profile.png'; // Avatar por defecto

  // Inicializamos los módulos comunes
  await loadCurrentUserData();
  window.notificationManager = await initializeNotifications();
  window.chatManager = initializeChat({
    chatListContainerId: 'chat-list-container',
    mainChatSectionId: 'chat-section-main',
    pageContentSectionId: 'profile-section', // ID del contenido principal de esta página
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

  // --- Lógica de Menús de la Barra Superior ---
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

  // --- Lógica Específica de la Página de Perfil ---

  function getLevelImage(level) {
    switch(level) {
      case 'oro': return '../Assets/Oro.png';
      case 'plata': return '../Assets/Plata.png';
      case 'rubi': return '../Assets/Rubi.png';
      case 'diamante': return '../Assets/Diamante.png';
      default: return '';
    }
  }

  function getCupsDisplay(cupIds) {
    if (!cupIds || cupIds.length === 0) {
      return 'No tienes ninguna todavía';
    }

    const cupImageMapping = {
      'champions': 'Copa1.png',
      'libertadores': 'Copa2.png',
      'europa': 'Copa3.png',
      'worldcup': 'Copa4.png',
      'africa': 'Copa5.png',
      'asia': 'Copa6.png'
    };

    let cupsHtml = '';
    cupIds.forEach(cupId => {
      const imageName = cupImageMapping[cupId];
      if (imageName) {
        cupsHtml += `<img src="../Assets/${imageName}" alt="${cupId}" class="cup-icon" title="${cupId}">`;
      }
    });

    return cupsHtml;
  }

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  async function loadProfile() {
    const profileSection = document.getElementById('profile-section');
    try {
      // Por ahora, siempre cargamos el perfil del usuario logueado.
      // En el futuro, aquí se podría pasar un ID de usuario desde la URL.
      const response = await fetch('../php/get_profile_data.php');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'No se pudo cargar el perfil.');
      }

      const userData = result.profile;
      
      // Como es el perfil propio, siempre estará activo.
      const status = 'activo'; 

      if (userData.isOwnProfile) {
        profileSection.innerHTML = `
          <div class="profile-container own-profile">
            <div class="profile-header"><h2>Mi Perfil</h2><button class="edit-btn" id="editProfile">Editar</button></div>
            <div class="profile-content">
              <div class="profile-left">
                <div class="profile-image-container"><img src="${userData.fotoPerfil || '../Assets/Profile.png'}" alt="Avatar" class="profile-avatar" id="profileAvatar"><div class="change-image-overlay" id="changeImageBtn"><span>📸</span><p>Cambiar foto</p></div></div>
                <div class="status-indicator"><span class="status-dot ${status}"></span><span class="status-text">${status === 'activo' ? 'Activo' : 'Inactivo'}</span></div>
              </div>
              <div class="profile-right">
                <div class="profile-field"><label>Usuario:</label><input type="text" id="username" value="${userData.nomUsuario}" readonly></div>
                <div class="profile-field"><label>Nombre:</label><input type="text" id="displayName" value="${userData.nomCompleto}" readonly></div>
                <div class="profile-field"><label>Nivel:</label><div class="level-display"><div class="level-circle ${userData.nivel ? userData.nivel.toLowerCase() : ''}"><img src="${getLevelImage(userData.nivel)}" alt="${userData.nivel}" class="level-image"></div><span class="level-text">${userData.nivel || 'N/A'}</span></div></div>
                <div class="profile-field"><label>Copas:</label><div class="cups-display">${getCupsDisplay(userData.copas)}</div></div>
                <div class="profile-field"><label>Biografía:</label><textarea id="bio" rows="3" readonly>${userData.biografia || ''}</textarea></div>
                <div class="profile-actions" id="profileActions" style="display: none;"><button class="btn-primary" id="saveProfile">Guardar</button><button class="btn-secondary" id="cancelEdit">Cancelar</button></div>
              </div>
            </div>
          </div>`;
      } else {
        // Aquí iría la lógica para mostrar el perfil de otro usuario.
        // Por ahora, mostramos un mensaje.
        profileSection.innerHTML = `<p>Funcionalidad para ver otros perfiles aún no implementada.</p>`;
      }
      addEventListeners(userData);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      profileSection.innerHTML = `<div class="profile-container"><p style="color: #ff4d4d; text-align: center;">Error al cargar el perfil: ${error.message}</p></div>`;
    }
  }

  function addEventListeners(userData) {
    const editBtn = document.getElementById('editProfile');
    if (editBtn) editBtn.addEventListener('click', toggleEditMode);
    
    const changeImageBtn = document.getElementById('changeImageBtn');
    if (changeImageBtn) changeImageBtn.addEventListener('click', () => {
        // Solo permite cambiar la foto si estamos en modo edición
        if (!document.body.classList.contains('editing-profile')) return;
        document.getElementById('imageInput').click(); // Abre el selector de archivos directamente
    });

    const imageInput = document.getElementById('imageInput');
    if(imageInput) imageInput.addEventListener('change', handleImagePreview);

    const saveBtn = document.getElementById('saveProfile');
    if (saveBtn) saveBtn.addEventListener('click', saveProfileChanges);

    // El botón de cancelar ahora está integrado en el de editar
    // const cancelEditBtn = document.getElementById('cancelEdit');
    // if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => toggleEditMode(false));
  }

  function handleImagePreview(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        newProfilePicFile = input.files[0]; // Guardamos el archivo para subirlo después
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profileAvatar').src = e.target.result; // Mostramos la vista previa
        };
        reader.readAsDataURL(newProfilePicFile);
    }
  }

  function toggleEditMode() {
    const isEditing = document.body.classList.toggle('editing-profile');
    const inputs = document.querySelectorAll('#username, #displayName, #bio');
    const editBtn = document.getElementById('editProfile');
    const actions = document.getElementById('profileActions');
    const overlay = document.querySelector('.change-image-overlay');

    inputs.forEach(input => {
      input.readOnly = !isEditing;
      input.classList.toggle('editable', isEditing);
    });

    if (isEditing) {
        editBtn.textContent = 'Cancelar';
        actions.style.display = 'flex';
        overlay.style.cursor = 'pointer';
    } else {
        editBtn.textContent = 'Editar';
        actions.style.display = 'none';
        overlay.style.cursor = 'default';
        newProfilePicFile = null; // Descartar la foto seleccionada si se cancela
        loadProfile(); // Recargar para descartar todos los cambios
    }
  }

  async function saveProfileChanges() {
    const username = document.getElementById('username').value;
    const displayName = document.getElementById('displayName').value;
    const bio = document.getElementById('bio').value;
    
    const modal = document.getElementById('imageModal');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('displayName', displayName);
    formData.append('bio', bio);

    if (newProfilePicFile) {
        formData.append('profilePic', newProfilePicFile);
    }

    try {
      const response = await fetch('../php/update_profile.php', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        document.body.classList.remove('editing-profile'); // Salir del modo edición
        await loadCurrentUserData(); // Volver a cargar los datos del usuario para actualizar la barra superior
        loadProfile(); // Recargar para mostrar los datos guardados y bloquear campos
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('Error de conexión al guardar el perfil.');
    }
  }

  // Carga inicial del perfil
  loadProfile();

  // Recargar la lista de chats y notificaciones cuando la ventana/pestaña recupera el foco
  window.addEventListener('focus', () => {
    if (window.chatManager) window.chatManager.loadChatList();
    if (window.notificationManager) window.notificationManager.loadFriendRequests();
  });

  console.log("Página de Perfil cargada correctamente.");
});