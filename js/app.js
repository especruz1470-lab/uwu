/**
 * app.js
 * 
 * Contiene la lógica compartida y de inicialización para todas las páginas
 * de la aplicación, como la carga de datos de usuario y la gestión de menús.
 */

/**
 * Carga los datos del usuario con sesión activa y actualiza la barra superior.
 * Redirige al login si no hay sesión.
 * @returns {Promise<Object|null>} Los datos del usuario o null si falla.
 */
async function loadCurrentUserData() {
  try {
    const response = await fetch('../php/get_user_data.php');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.success) {
      const user = data.user;
      const userIcon = document.querySelector('.topbar .user-icon');
      const userName = document.querySelector('.topbar .user-info strong');

      if (userIcon) userIcon.src = user.profilePic || '../Assets/Profile.png';
      if (userName) userName.textContent = user.username;
      
      return user; // Devuelve los datos del usuario
    } else {
      window.location.href = 'InicioSesion.html';
      return null;
    }
  } catch (error) {
    console.error('Error al cargar los datos del usuario:', error);
    window.location.href = 'InicioSesion.html';
    return null;
  }
}

/**
 * Inicializa los menús desplegables de la barra superior.
 */
function initializeTopbarMenus() {
  // Menú "+" (Agregar Amigo / Crear Grupo)
  const addBtn = document.querySelector(".add-btn");
  const addOptions = document.querySelector(".add-options");

  if (addBtn && addOptions) {
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addOptions.classList.toggle("show");
    });

    addOptions.querySelector(".dropdown-item:nth-child(1)").addEventListener("click", () => window.location.href = "CrearGrupo.html");
    addOptions.querySelector(".dropdown-item:nth-child(2)").addEventListener("click", () => window.location.href = "AgregarAmigo.html");

    document.addEventListener("click", (e) => {
      if (!addOptions.contains(e.target) && e.target !== addBtn) {
        addOptions.classList.remove("show");
      }
    });
  }

  // Menú "⋮" (Perfil / Cerrar Sesión)
  const verticalMenu = document.querySelector(".vertical-menu");
  const menuDropdown = document.querySelector(".menu-dropdown");

  if (verticalMenu && menuDropdown) {
    verticalMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle("show");
    });

    menuDropdown.querySelector(".dropdown-item:nth-child(1)").addEventListener("click", () => window.location.href = "Perfil.html");
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
    });

    document.addEventListener("click", () => menuDropdown.classList.remove("show"));
    menuDropdown.addEventListener("click", (e) => e.stopPropagation());
  }
}
