/**
 * Gestiona toda la funcionalidad del chat, incluyendo la lista de chats,
 * la apertura de conversaciones, el envío/recepción de mensajes y las videollamadas.
 */
function initializeChat(options) {
  const {
    chatListContainerId,
    mainChatSectionId,
    pageContentSectionId,
    currentUserId,
    currentUserAvatar
  } = options;

  const chatListContainer = document.getElementById(chatListContainerId);
  const mainChatSection = document.getElementById(mainChatSectionId);
  const pageContentSection = document.getElementById(pageContentSectionId);

  let chatPollingInterval = null;
  let selectedFiles = [];
  let sharedKey = null; // Almacenará la clave de cifrado para el chat actual

  if (!chatListContainer || !mainChatSection) {
    console.error("No se encontraron los contenedores necesarios para el chat.");
    return;
  }

  /**
   * Carga dinámicamente el archivo CSS del chat si aún no ha sido cargado.
   */
  function loadChatCSS() {
    const cssId = 'chat-styles';
    if (!document.getElementById(cssId)) {
      const head = document.getElementsByTagName('head')[0];
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '../css/chat.css'; // Asegúrate de que esta ruta sea correcta
      link.media = 'all';
      head.appendChild(link);
    }
  }

  /**
   * Obtiene la ruta de la imagen del rango capitalizando la primera letra.
   * @param {string} rango - El nombre del rango en minúsculas (ej. 'oro').
   * @returns {string} La ruta completa a la imagen del rango.
   */
  function getRankImage(rango) {
    if (!rango) {
      return '../Assets/plata.png'; // Fallback por si el rango es nulo o undefined
    }
    // Convierte 'oro' a 'Oro', 'plata' a 'Plata', etc.
    const capitalizedRank = rango.charAt(0).toUpperCase() + rango.slice(1);
    return `../Assets/${capitalizedRank}.png`;
  }

  /**
   * Genera el HTML para mostrar los íconos de las copas.
   * @param {string[]} cupIds - Un array con los IDs de las copas.
   * @returns {string} El HTML de las imágenes de las copas.
   */
  function getCupsDisplay(cupIds) {
    if (!cupIds || cupIds.length === 0) {
      return '<span class="no-cups-text">Esta persona no posee copas</span>';
    }

    const cupImageMapping = {
      'champions': 'Copa1.png', 'libertadores': 'Copa2.png', 'europa': 'Copa3.png',
      'worldcup': 'Copa4.png', 'africa': 'Copa5.png', 'asia': 'Copa6.png'
    };

    let cupsHtml = '';
    cupIds.forEach(cupId => {
      const imageName = cupImageMapping[cupId];
      if (imageName) {
        cupsHtml += `<img src="../Assets/${imageName}" alt="${cupId}" class="cup-icon-chat" title="${cupId}">`;
      }
    });
    return cupsHtml;
  }

  loadChatCSS(); // Carga el CSS del chat al inicializar el script.
  loadChatList();

  /**
   * Carga y renderiza la lista de grupos y amigos en la barra lateral.
   */
  async function loadChatList() {
    const chatHeader = chatListContainer.querySelector('.chat-header');
    if (!chatHeader) {
      console.error("Chat header not found in chat-list-container.");
      return;
    }

    // Limpiar lista de chats anterior para recargarla
    let nextSibling = chatHeader.nextElementSibling;
    while (nextSibling) {
      const toRemove = nextSibling;
      nextSibling = nextSibling.nextElementSibling;
      toRemove.remove();
    }

    // Cargar grupos
    try {
      const response = await fetch('../php/get_groups.php');
      const data = await response.json();
      if (data.success && data.groups.length > 0) {
        const groupSection = document.createElement('div');
        groupSection.innerHTML = '<h3 class="chat-list-header">Grupos</h3>';
        data.groups.forEach(group => {
          const groupElement = document.createElement('div');
          groupElement.className = 'chat-item';
          groupElement.setAttribute('data-chat-type', 'group');
          groupElement.setAttribute('data-group-id', group.idGrupo);
          groupElement.setAttribute('data-group-name', group.nombreGrupo);
          groupElement.setAttribute('data-group-avatar', group.fotoGrupo_url ? '../' + group.fotoGrupo_url : '../Assets/group-placeholder.png');
          // Los grupos no tienen rango, así que no añadimos emblema.
          groupElement.innerHTML = `
            <img src="${group.fotoGrupo_url ? '../' + group.fotoGrupo_url : '../Assets/group-placeholder.png'}" class="chat-icon" alt="Grupo">
            <span class="chat-name-sidebar">${group.nombreGrupo}</span>
          `;
          groupSection.appendChild(groupElement);
        });
        chatListContainer.appendChild(groupSection);
      }
    } catch (error) {
      console.error('Error al cargar la lista de grupos:', error);
    }

    // Cargar amigos
    try {
      const response = await fetch('../php/get_friends.php');
      const data = await response.json();
      if (data.success && data.users.length > 0) {
        const usersSection = document.createElement('div');
        usersSection.innerHTML = '<h3 class="chat-list-header">Amigos</h3>';
        data.users.forEach(user => {
          const userElement = document.createElement('div');
          userElement.className = 'chat-item';
          userElement.setAttribute('data-chat-type', 'user');
          userElement.setAttribute('data-user-id', user.idUsuario);
          userElement.setAttribute('data-username', user.nomUsuario);
          userElement.setAttribute('data-avatar', user.fotoPerfil || '../Assets/Profile.png');
          // Guardamos el rango del usuario para referencia futura si es necesario
          userElement.setAttribute('data-rango', user.rango || 'plata');
          userElement.innerHTML = `
            <img src="${user.fotoPerfil ? '../' + user.fotoPerfil : '../Assets/Profile.png'}" class="chat-icon" alt="Usuario">
            <div class="chat-name-container">
              <span class="chat-name-sidebar">${user.nomUsuario}</span>
              <img src="${getRankImage(user.rango || 'plata')}" class="rank-badge-sidebar" title="${user.rango || 'plata'}">
            </div>
          `;
          usersSection.appendChild(userElement);
        });
        chatListContainer.appendChild(usersSection);
      }
    } catch (error) {
      console.error('Error al cargar la lista de amigos:', error);
    }
  }

  function showChatView() {
    if (pageContentSection) pageContentSection.classList.add('hidden');
    if (mainChatSection) mainChatSection.classList.remove('hidden');
  }

  function hideChatView() {
    if (mainChatSection) {
      mainChatSection.classList.add('hidden');
      if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
      }
      mainChatSection.innerHTML = '';
    }
    if (pageContentSection) pageContentSection.classList.remove('hidden');
  }

  async function openGroupChat(groupId, groupName, groupAvatar) {
    if (!currentUserId) {
      alert("Cargando datos de usuario, por favor espera.");
      return;
    }
    selectedFiles = [];

    let members = [];
    let membersMap = {};
    try {
      const response = await fetch(`../php/get_group_messages.php?group_id=${groupId}`);
      const data = await response.json();
      if (!data.success) {
        alert(`Error al cargar el grupo: ${data.message}`);
        return;
      }
      members = data.members;
      members.forEach(m => { membersMap[m.idUsuario] = m.nomUsuario; });

      const memberNames = members.map(m => m.idUsuario == currentUserId ? 'Tú' : m.nomUsuario).join(', ');
      mainChatSection.innerHTML = `
        <div class="chat-panel chat-grupal">
          <div class="chat-topbar group-chat-topbar">
            <div class="chat-info">
              <img src="${groupAvatar}" class="chat-avatar">
              <div>
                <div class="chat-name">${groupName}</div>
                <div class="chat-members" style="font-size:12px;color:#aaa;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${memberNames.replace(/"/g, '&quot;')}">
                  ${memberNames}
                </div>
              </div>
            </div>
            <div class="chat-actions">
              <!-- Botones de acción de la barra superior (si los hubiera) -->
            </div>
            <button class="chat-close-btn">×</button>
          </div>
          <div class="chat-messages"></div>
          <div class="chat-input" data-group-id="${groupId}">
            <div class="file-preview-container"></div>
            <div class="input-row">
              <label class="btn-upload">📎<input type="file" class="file-input" style="display:none;" accept="image/*,video/mp4,video/webm" multiple></label>
              <input type="text" id="message-input-field" name="message-input-field" class="message-input" placeholder="Escribe un mensaje en ${groupName}...">
              <button class="send-btn">➤</button>
            </div>
          </div>
        </div>
      `;
      showChatView();

      const messagesDiv = mainChatSection.querySelector(".chat-messages");
      mainChatSection.querySelector('.chat-close-btn').addEventListener('click', hideChatView);

      let lastMessageId = 0;
      data.messages.forEach(msg => {
        const messageType = msg.idUsuarioEmisor == currentUserId ? 'sent' : 'received';
        const senderName = messageType === 'sent' ? 'Tú' : (membersMap[msg.idUsuarioEmisor] || 'Usuario desconocido');
        appendMessage(messagesDiv, msg, messageType, senderName);
        if (msg.idMensajeGrupo > lastMessageId) {
          lastMessageId = msg.idMensajeGrupo;
        }
      });

    } catch (error) {
      console.error("Error al abrir chat de grupo:", error);
      alert("No se pudo cargar el chat del grupo.");
      return;
    }

    const input = mainChatSection.querySelector(".message-input");
    const sendBtn = mainChatSection.querySelector(".send-btn");
    const previewContainer = mainChatSection.querySelector(".file-preview-container");
    const fileInput = mainChatSection.querySelector(".file-input");

    const sendGroupMessage = async () => {
      const text = input.value.trim();
      if (!text && selectedFiles.length === 0) return;

      const formData = new FormData();
      formData.append('group_id', groupId);
      if (text) formData.append('message_text', text);
      selectedFiles.forEach(file => formData.append('files[]', file));

      try {
        const response = await fetch('../php/send_group_message.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success && result.sent_message) {
          appendMessage(mainChatSection.querySelector(".chat-messages"), result.sent_message, "sent", "Tú");
        } else {
          alert(`Error: ${result.message || 'No se pudo enviar el mensaje.'}`);
        }
      } catch (error) {
        alert("Error de conexión al enviar el mensaje.");
      }

      // Notificar al backend para actualizar progreso de tareas
      const taskData = new FormData();
      taskData.append('tipoActividad', selectedFiles.length > 0 ? 'media' : 'msg');
      taskData.append('idGrupo', groupId);
      fetch('../php/actualizar_progreso_tarea.php', { method: 'POST', body: taskData })
        .then(() => {
          // Dispara un evento para que otras partes de la UI se actualicen
          window.dispatchEvent(new CustomEvent('task-progress-updated'));
        });

      // Limpiar el input y la vista previa DESPUÉS de que todo se ha enviado.
      input.value = "";
      previewContainer.innerHTML = "";
      selectedFiles = [];
    };

    sendBtn.addEventListener("click", sendGroupMessage);
    input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendGroupMessage(); });
    
    fileInput.addEventListener('change', (e) => handleFileSelection(e, previewContainer));
    previewContainer.addEventListener('click', (e) => handleRemoveFile(e, previewContainer));
  }

  async function openUserChat(userId, username, avatar, rango) {
    if (!currentUserId) {
      alert("Cargando datos de usuario, por favor espera un segundo y vuelve a intentarlo.");
      return;
    }
    // Generar la clave secreta compartida para esta conversación
    sharedKey = await getSharedSecretKey(currentUserId, userId);

    let lastMessageId = 0;

    selectedFiles = [];
    mainChatSection.innerHTML = `
      <div class="chat-panel">
        <div class="chat-topbar">
          <div class="chat-info">
            <img src="${avatar.startsWith('uploads/') ? '../' + avatar : avatar}" class="chat-avatar" alt="${username}">
            <div>
              <div class="chat-name">${username}</div>
              <div class="cups-display-chat" id="cups-display-chat-header">
                <div class="loading-spinner-cups"></div>
              </div>
            </div>
          </div>
          <div class="encrypt-switch-container">
            <span>Encriptar chat</span>
            <label class="switch">
              <input type="checkbox" id="encrypt-chat-toggle">
              <span class="slider round"></span>
            </label>
          </div>
          <button class="chat-close-btn">×</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input" data-recipient-id="${userId}">
          <div class="file-preview-container"></div>
          <div class="input-row">
            <button class="video-btn">🎥</button>
            <label class="btn-upload">📎<input type="file" class="file-input" style="display:none;" accept="image/*,video/mp4,video/webm" multiple></label>
            <input type="text" id="message-input-field" name="message-input-field" class="message-input" placeholder="Escribe un mensaje...">
            <button class="send-btn">➤</button>
          </div>
        </div>
      </div>
    `;

    showChatView();

    // Cargar las copas del usuario del chat
    try {
      const profileResponse = await fetch(`../php/get_profile_data.php?user_id=${userId}`);
      const profileResult = await profileResponse.json();
      const cupsContainer = mainChatSection.querySelector('#cups-display-chat-header');

      if (profileResult.success && cupsContainer) {
        cupsContainer.innerHTML = getCupsDisplay(profileResult.profile.copas);
      } else {
        cupsContainer.innerHTML = '<span class="no-cups-text">No se pudieron cargar las copas.</span>';
      }
    } catch (error) {
      console.error('Error al cargar las copas del perfil:', error);
    }

    const messagesDiv = mainChatSection.querySelector(".chat-messages");
    const fileInput = mainChatSection.querySelector(".file-input");
    const chatPanel = mainChatSection.querySelector('.chat-panel');

    mainChatSection.querySelector('.chat-close-btn').addEventListener('click', hideChatView);
    mainChatSection.querySelector('.video-btn').addEventListener('click', () => startVideoCall(chatPanel, currentUserId, userId));
    
    // Sincronización del interruptor de cifrado
    const encryptToggle = mainChatSection.querySelector('#encrypt-chat-toggle');
    if (encryptToggle) {
      // 1. Cargar el estado inicial del cifrado desde la BD
      try {
        const configResponse = await fetch(`../php/get_chat_config.php?other_user_id=${userId}`);
        const configData = await configResponse.json();
        if (configData.success) {
          encryptToggle.checked = configData.isEncrypted;
        }
      } catch (error) {
        console.error("Error al cargar la configuración del chat:", error);
      }

      // 2. Guardar el estado en la BD y notificar al otro usuario
      encryptToggle.addEventListener('change', async () => {
        const isEncrypted = encryptToggle.checked;
        // Enviar un mensaje de sistema para notificar al otro usuario
        sendSystemMessage(userId, `SYSTEM_ENCRYPTION_STATE_CHANGED`);
        // Guardar el estado en la base de datos
        await fetch('../php/set_chat_config.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ other_user_id: userId, is_encrypted: isEncrypted })
        });
      });
    }

    try {
      const response = await fetch(`../php/get_messages.php?other_user_id=${userId}`);
      const initialData = await response.json();
      
      if (initialData.success) {
        initialData.messages.forEach(msg => {
          // Ignorar los mensajes de sistema para que no se muestren en el historial inicial
          if (msg.mensaje_texto && msg.mensaje_texto.startsWith('SYSTEM_')) {
              return; 
          }
          const messageType = msg.idUsuarioEmisor == currentUserId ? 'sent' : 'received';
          // Al cargar el historial, los mensajes propios también pueden estar cifrados, así que los desciframos.
          appendMessage(messagesDiv, msg, messageType, messageType === 'sent' ? 'Tú' : username, sharedKey);
          if (msg.idMensaje > lastMessageId) {
            lastMessageId = msg.idMensaje;
          }
        });

        if (chatPollingInterval) clearInterval(chatPollingInterval);

        chatPollingInterval = setInterval(async () => {
          try {
            const pollResponse = await fetch(`../php/get_new_messages.php?other_user_id=${userId}&last_message_id=${lastMessageId}`);
            const newData = await pollResponse.json();

            if (newData.success && newData.messages.length > 0) {
              newData.messages.forEach(msg => {
                if (msg.idUsuarioEmisor != currentUserId) { 
                  // Si es un mensaje de sistema, no lo mostramos, sino que actualizamos el estado del switch
                  if (msg.mensaje_texto && msg.mensaje_texto.startsWith('SYSTEM_ENCRYPTION_STATE_CHANGED')) {
                    // Vuelve a consultar a la BD para obtener el estado más reciente
                    fetch(`../php/get_chat_config.php?other_user_id=${userId}`)
                      .then(res => res.json())
                      .then(configData => {
                        if (configData.success) {
                          encryptToggle.checked = configData.isEncrypted;
                        }
                      });
                  } else {
                    appendMessage(messagesDiv, msg, 'received', username, sharedKey);
                  }
                }
                if (msg.idMensaje > lastMessageId) {
                  lastMessageId = msg.idMensaje;
                }
              });
            }
          } catch (pollError) { console.error("Error en polling:", pollError); }
        }, 3000);
      }
      else {
        console.error("Error del servidor al cargar mensajes:", initialData.message);
        messagesDiv.innerHTML = `<p style="text-align:center; color:#888;">No se pudieron cargar los mensajes. Error: ${initialData.message}</p>`;
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      messagesDiv.innerHTML = '<p style="text-align:center; color:#888;">No se pudieron cargar los mensajes.</p>';
    }

    const input = mainChatSection.querySelector(".message-input");
    const sendBtn = mainChatSection.querySelector(".send-btn");
    const previewContainer = mainChatSection.querySelector(".file-preview-container");

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text && selectedFiles.length === 0) return;

      const isEncrypted = mainChatSection.querySelector('#encrypt-chat-toggle')?.checked || false;
      let messageToSend = text;

      // Cifrar el mensaje si el interruptor está activo y hay texto
      if (isEncrypted && text && sharedKey) {
        messageToSend = await encryptMessage(sharedKey, text);
      }

      const formData = new FormData();
      formData.append('recipient_id', userId);
      if (messageToSend) {
        formData.append('message_text', messageToSend);
      }
      formData.append('is_encrypted', isEncrypted && !!text); // Solo marcar como cifrado si hay texto
      selectedFiles.forEach(file => {
        formData.append('files[]', file);
      });

      input.value = "";
      previewContainer.innerHTML = "";
      selectedFiles = [];

      try {
        const response = await fetch('../php/send_message.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success && result.sent_message) {
          // Para mostrar nuestro propio mensaje, usamos el texto original antes de cifrar
          const displayMessage = { ...result.sent_message, mensaje_texto: text };
          appendMessage(messagesDiv, displayMessage, "sent", "Tú", null); // No necesitamos descifrar nuestro propio mensaje al enviarlo

          if (result.sent_message.idMensaje > lastMessageId) {
            lastMessageId = result.sent_message.idMensaje;
          }
        } else {
          console.error("Error al enviar mensaje:", result.message);
          alert(`Error: ${result.message || 'No se pudo enviar el mensaje.'}`);
        }
      } catch (error) {
        console.error("Error de red al enviar mensaje:", error);
        alert("Error de conexión al enviar el mensaje.");
      }
    };

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
    fileInput.addEventListener('change', (e) => handleFileSelection(e, previewContainer));
    previewContainer.addEventListener('click', (e) => handleRemoveFile(e, previewContainer));
  }

  /**
   * Envía un mensaje de sistema para acciones como cambiar el estado de cifrado.
   */
  async function sendSystemMessage(recipientId, command) {
    const formData = new FormData();
    formData.append('recipient_id', recipientId);
    formData.append('message_text', command);
    formData.append('is_system', 'true'); // Flag para que el backend lo maneje

    try {
      await fetch('../php/send_message.php', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error("Error al enviar mensaje de sistema:", error);
    }
  }

  async function appendMessage(container, msgData, type, senderName, key) {
    const div = document.createElement("div");
    div.classList.add("message", type);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let contentHTML = '';
    let messageText = msgData.mensaje_texto;
    const senderToShow = (type === 'received' && msgData.idGrupo) ? senderName : '';
    
    // Descifrar si es necesario (siempre que el mensaje esté cifrado, sin importar el estado del switch en la UI).
    if (msgData.es_cifrado == 1 && messageText && key) {
        messageText = await decryptMessage(key, messageText);
    }

    const encryptedIcon = msgData.es_cifrado == 1 ? '<span class="encrypted-icon" title="Mensaje cifrado">🔒</span>' : '';

    const images = [msgData.imagen1_url, msgData.imagen2_url, msgData.imagen3_url, msgData.imagen4_url].filter(Boolean);

    if (images.length > 0) {
      contentHTML += `<div class="message-image-grid grid-${images.length}">`;
      contentHTML += images.map(url => `<img src="../${url}" alt="imagen adjunta" class="message-img">`).join('');
      contentHTML += `</div>`;
    }

    if (msgData.video_url) {
      contentHTML += `<div class="message-video-container">
        <video controls src="../${msgData.video_url}" class="message-video"></video>
      </div>`;
    }

    if (messageText) {
      contentHTML += `<p style="margin:0;">${encryptedIcon} ${messageText}</p>`;
    }

    div.innerHTML = `
      ${type === 'received' ? `<span class="sender">${senderName}</span>` : ''}
      <div class="message-content">${contentHTML}</div>
      <div class="timestamp">${time}</div>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function handleFileSelection(e, previewContainer) {
    const files = Array.from(e.target.files);
    previewContainer.innerHTML = "";
    selectedFiles = [];

    const images = files.filter(f => f.type.startsWith('image/'));
    const videos = files.filter(f => f.type.startsWith('video/'));

    if (images.length > 0 && videos.length > 0) {
      alert("No puedes enviar imágenes y videos al mismo tiempo.");
      e.target.value = "";
      return;
    }

    if (images.length > 4) {
      alert("Puedes seleccionar un máximo de 4 imágenes.");
      selectedFiles = images.slice(0, 4);
    } else if (videos.length > 1) {
      alert("Puedes seleccionar solo 1 video.");
      selectedFiles = videos.slice(0, 1);
    } else {
      selectedFiles = [...images, ...videos];
    }

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.setAttribute('data-file-index', index);

        if (file.type.startsWith('image/')) {
          previewItem.innerHTML = `<img src="${event.target.result}" alt="preview"><button class="remove-file-btn">×</button>`;
        } else {
          previewItem.innerHTML = `<video src="${event.target.result}" alt="preview"></video><button class="remove-file-btn">×</button>`;
        }
        previewContainer.appendChild(previewItem);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function handleRemoveFile(e, previewContainer) {
    if (e.target.classList.contains('remove-file-btn')) {
      const itemToRemove = e.target.closest('.preview-item');
      const indexToRemove = parseInt(itemToRemove.dataset.fileIndex, 10);
      
      selectedFiles.splice(indexToRemove, 1);
      itemToRemove.remove();

      const remainingItems = previewContainer.querySelectorAll('.preview-item');
      remainingItems.forEach((item, newIndex) => {
        item.dataset.fileIndex = newIndex;
      });
    }
  }

  chatListContainer.addEventListener('click', (e) => {
    const chatItem = e.target.closest('.chat-item');
    if (!chatItem) return;

    const chatType = chatItem.getAttribute('data-chat-type');
    if (chatType === 'user') {
      const userId = chatItem.getAttribute('data-user-id');
      const username = chatItem.getAttribute('data-username');
      const avatar = chatItem.getAttribute('data-avatar');
      const rango = chatItem.getAttribute('data-rango');
      openUserChat(userId, username, avatar, rango);
    } else if (chatType === 'group') {
      const groupId = chatItem.getAttribute('data-group-id');
      const groupName = chatItem.getAttribute('data-group-name');
      const groupAvatar = chatItem.getAttribute('data-group-avatar');
      openGroupChat(groupId, groupName, groupAvatar);
    }
  });

  mainChatSection.addEventListener('click', (e) => {
    if (e.target.classList.contains('message-img')) {
      const lightbox = document.createElement('div');
      lightbox.id = 'image-lightbox';
      lightbox.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; align-items: center;
        justify-content: center; z-index: 2000; cursor: pointer;
      `;
      const img = document.createElement('img');
      img.src = e.target.src;
      img.style.cssText = `
        max-width: 90%; max-height: 90%; object-fit: contain;
      `;
      lightbox.appendChild(img);
      document.body.appendChild(lightbox);

      lightbox.addEventListener('click', () => {
        document.body.removeChild(lightbox);
      });
    }
  });

  // Exponer la función para recargar la lista de chats
  return { loadChatList };
}