document.addEventListener("DOMContentLoaded", async () => {
  // Cargar datos de usuario y menús desde el script central app.js
  const userData = await loadCurrentUserData();
  if (!userData) return; // Detener si no se cargan los datos del usuario

  initializeTopbarMenus();

  window.notificationManager = await initializeNotifications();
  window.chatManager = initializeChat({
    chatListContainerId: 'chat-list-container',
    mainChatSectionId: 'chat-section-main',
    pageContentSectionId: 'tareas-container', // ID del contenido principal de esta página
    currentUserId: userData.id,
    currentUserAvatar: userData.profilePic
  });

  // --- Lógica para el modal de Crear Tarea ---

  const crearTareaBtn = document.querySelector('.btn-crear-tarea');
  const modal = document.getElementById('crear-tarea-modal');
  const closeModalBtn = document.querySelector('.modal-close');
  const formCrearTarea = document.getElementById('form-crear-tarea');
  
  const tareasGrupalesContainer = document.getElementById('tareas-grupales-container');
  // --- Lógica para Cargar y Mostrar Tareas ---
  const loadTareasGrupales = async () => {
    const container = document.getElementById('tareas-grupales-container');
    if (!container) return;

    try {
      const response = await fetch('../php/get_tareas.php');
      const data = await response.json();

      if (data.success) {
        container.innerHTML = ''; // Limpiar contenedor
        const tareasPorGrupo = data.tareas.reduce((acc, tarea) => {
          (acc[tarea.nombreGrupo] = acc[tarea.nombreGrupo] || []).push(tarea);
          return acc;
        }, {});

        if (Object.keys(tareasPorGrupo).length === 0) {
          container.innerHTML = '<p>No hay tareas asignadas a tus grupos.</p>';
          return;
        }

        for (const nombreGrupo in tareasPorGrupo) {
          const tareas = tareasPorGrupo[nombreGrupo];
          const limites = { msg: 5, media: 1, vote: 1 };
          const descripciones = {
            msg: "Para completar esta tarea, debes enviar 5 mensajes en el chat del grupo.",
            media: "Para completar esta tarea, debes enviar una foto o un video al chat del grupo.",
            vote: "Para completar esta tarea, debes votar por un equipo en la sección de Torneo."
          };

          const groupTasksHTML = tareas.map(tarea => {
            const isCompleted = tarea.estado === 'completada';
            const progreso = Math.min(tarea.progreso, limites[tarea.tipoActividad]);
            const textoProgreso = `(${progreso}/${limites[tarea.tipoActividad]})`;
            const descripcion = descripciones[tarea.tipoActividad] || "Completa la tarea para ganar puntos.";

            return `
              <div class="task-item ${isCompleted ? 'completed' : ''}" data-description="${descripcion}">
                <input type="checkbox" ${isCompleted ? 'checked' : ''} disabled>
                <span class="task-text">${tarea.nombreTarea} ${textoProgreso}</span>
              </div>
            `;
          }).join('');

          container.innerHTML += `<div class="group-task-card"><h4>${nombreGrupo}</h4>${groupTasksHTML}</div>`;
        }
      }
    } catch (error) {
      console.error('Error al cargar tareas grupales:', error);
      container.innerHTML = '<p>Error al cargar las tareas.</p>';
    }
  };

  // Función para verificar si el usuario es admin y mostrar el botón
  const checkAdminRoleAndShowButton = async () => {
    try {
      const response = await fetch('../php/get_admin_groups.php');
      const data = await response.json();
      
      if (data.success && data.groups.length > 0) {
        if (crearTareaBtn) {
          crearTareaBtn.style.display = 'inline-block';
        }
      }
    } catch (error) {
      console.error('Error al verificar el rol de administrador:', error);
    }
  };
  
  await checkAdminRoleAndShowButton();
  
  // Función para cargar los grupos del admin en el modal
  const loadAdminGroups = async () => {
    const grupoSelect = document.getElementById('tarea-grupo');
    const grupoContainer = grupoSelect.parentElement;

    try {
      const response = await fetch('../php/get_admin_groups.php');
      const data = await response.json();
      
      if (data.success && data.groups.length > 0) {
        grupoContainer.style.display = 'block'; // Muestra el selector
        grupoSelect.innerHTML = '<option value="">Selecciona un grupo</option>'; // Limpia y añade opción por defecto
        data.groups.forEach(group => {
          const option = document.createElement('option');
          option.value = group.idGrupo;
          option.textContent = group.nombreGrupo;
          grupoSelect.appendChild(option);
        });
      } else {
        // Si no es admin de ningún grupo, oculta la opción de seleccionar grupo.
        grupoContainer.style.display = 'none';
        grupoSelect.innerHTML = '';
      }
    } catch (error) {
      console.error('Error al cargar grupos de administrador:', error);
      grupoContainer.style.display = 'none';
    }
  };

  if (crearTareaBtn && modal && closeModalBtn && formCrearTarea) {
    // Abrir el modal
    crearTareaBtn.addEventListener('click', () => {
      loadAdminGroups(); // Carga los grupos cada vez que se abre el modal
      modal.style.display = 'flex';
    });

    // Cerrar el modal con el botón 'x'
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Cerrar el modal al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Manejar el envío del formulario
    formCrearTarea.addEventListener('submit', async(e) => {
      e.preventDefault();
      const formData = new FormData(formCrearTarea);
      const grupo = formData.get('grupo');
      const actividad = formData.get('actividad');

      // Validar que se haya seleccionado una actividad y un grupo (si aplica)
      if (!actividad || (document.getElementById('grupo-select-container').style.display !== 'none' && !grupo)) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
      }

      try {
        const response = await fetch('../php/crear_tarea.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
          modal.style.display = 'none';
          formCrearTarea.reset();
          loadTareasGrupales(); // Recargar la lista de tareas
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        alert('Error de conexión al crear la tarea.');
      }
    });
  }
  // Recargar la lista de chats y notificaciones cuando la ventana/pestaña recupera el foco
  window.addEventListener('focus', () => {
    if (window.chatManager) window.chatManager.loadChatList();
    if (window.notificationManager) window.notificationManager.loadFriendRequests();
  });

  // Listener para mostrar la descripción de la tarea
  if (tareasGrupalesContainer) {
    tareasGrupalesContainer.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      if (taskItem && taskItem.dataset.description) {
        alert(taskItem.dataset.description);
      }
    });
  }
  // Escuchar el evento personalizado para recargar las tareas
  window.addEventListener('task-progress-updated', loadTareasGrupales);

  loadTareasGrupales(); // Cargar tareas al iniciar la página
  console.log("Página de Tareas cargada correctamente.");
});