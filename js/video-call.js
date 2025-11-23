/**
 * Inicia y gestiona una videollamada de Agora.io dentro del panel de chat.
 * @param {HTMLElement} chatPanel El elemento del DOM que contiene el chat.
 * @param {string} currentUserId El ID del usuario actual.
 * @param {string} otherUserId El ID del otro usuario en la llamada.
 */
async function startVideoCall(chatPanel, currentUserId, otherUserId) {
  if (!chatPanel || !currentUserId || !otherUserId) {
    console.error("Faltan parámetros para iniciar la videollamada.");
    return;
  }

  // --- INTERRUPTOR PARA USAR TOKEN FIJO (PARA DEPURACIÓN) ---
  // Cambia a 'true' para usar el token y canal fijos de abajo.
  const USE_HARDCODED_TOKEN = false;

  // --- Variables de estado de la llamada ---
  const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  let localTracks = {
    audio: null,
    video: null
  };

  // --- 1. Crear y mostrar la UI de la llamada ---
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-call-container';
  videoContainer.innerHTML = `
    <div class="video-grid">
      <div id="remote-video-container" class="video-participant"><img src="../Assets/NoConnection.png" alt="Esperando usuario..."></div>
      <div id="local-video-container" class="video-participant"><div class="loading-spinner"></div><span>Iniciando...</span></div>
    </div>
    <div class="video-controls">
      <button id="toggle-mic-btn" class="control-btn" title="Silenciar Micrófono">🎤</button>
      <button id="toggle-cam-btn" class="control-btn" title="Apagar Cámara">📷</button>
      <button id="hang-up-btn" class="control-btn hang-up" title="Colgar">📞</button>
    </div>
  `;

  const chatMessages = chatPanel.querySelector('.chat-messages');
  const chatInput = chatPanel.querySelector('.chat-input');
  if (chatMessages) chatMessages.style.display = 'none';
  if (chatInput) chatInput.style.display = 'none';
  chatPanel.appendChild(videoContainer);

  const localPlayerContainer = document.getElementById('local-video-container');
  const remotePlayerContainer = document.getElementById('remote-video-container');

  // --- 2. Funciones de control de la llamada ---

  const leaveCall = async () => {
    // Detener y cerrar todas las pistas locales
    for (const trackName in localTracks) {
      const track = localTracks[trackName];
      if (track) {
        track.stop();
        track.close();
        localTracks[trackName] = null;
      }
    }

    // Desuscribirse de todos los usuarios remotos
    agoraClient.remoteUsers.forEach(user => {
      if (user.audioTrack) user.audioTrack.stop();
      if (user.videoTrack) user.videoTrack.stop();
    });

    // Salir del canal
    await agoraClient.leave();

    if (chatMessages) chatMessages.style.display = 'flex';
    if (chatInput) chatInput.style.display = 'flex';
    videoContainer.remove();
    console.log("Videollamada finalizada.");
  };

  // --- 3. Lógica principal de la llamada ---

  try {
    // Configurar listeners ANTES de unirse
    agoraClient.on("user-published", async (user, mediaType) => {
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === "video") {
        remotePlayerContainer.innerHTML = ''; // Limpiar el contenedor
        user.videoTrack.play(remotePlayerContainer);
      }
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });

    agoraClient.on("user-unpublished", (user, mediaType) => {
      if (mediaType === 'video') {
        remotePlayerContainer.innerHTML = `<img src="../Assets/NoCamera.png" alt="Cámara apagada">`;
      }
    });

    agoraClient.on("user-left", (user) => {
      remotePlayerContainer.innerHTML = `<img src="../Assets/NoConnection.png" alt="Usuario se fue">`;
    });

    // --- 3.0. Obtener token y unirse al canal ---
    let channelName, token, appId, uid;

    if (USE_HARDCODED_TOKEN) {
      // --- Método de depuración con datos fijos ---
      console.warn("Usando token y canal fijos para depuración.");
      appId = "e2bc3a41fddb43a69ccaa23cc00b8962"; // El App ID debe ser el mismo que en tu backend
      channelName = "main";
      token = "007eJxTYHAPXWVSNUcpPd+vcNuLKut/gbu924uez+rYJDbb5JBYlZYCQ6pRUrJxoolhWkpKkolxopllcnJiopFxcrKBQZKFpZnRTGWOzIZARgb3LA1WRgYIBPFZGHITM/MYGAAa9B4L";
      uid = parseInt(currentUserId, 10); // Usamos el ID del usuario actual
    } else {
      // --- Método de producción (obtiene el token del servidor) ---
      channelName = [currentUserId, otherUserId].sort().join('-');
      let responseText = ''; // Declarar responseText aquí para que esté disponible en el catch

      try {
          const response = await fetch(`../php/get_agora_token.php?channelName=${channelName}`, {
              credentials: 'include' // ¡ESTA LÍNEA ES LA SOLUCIÓN! Envía la cookie de sesión.
          });
          responseText = await response.text(); // Leemos la respuesta como texto primero.

          if (!response.ok) {
              throw new Error(`Error del servidor: ${response.status} ${response.statusText}. Respuesta: ${responseText}`);
          }
          
          const data = JSON.parse(responseText);

          if (!data.success) {
              throw new Error(data.message || 'El servidor denegó la solicitud de token.');
          }

          token = data.token;
          appId = data.appId;
          uid = parseInt(data.uid, 10);
        console.log("Token obtenido para el canal:", channelName);
      } catch (error) {
        alert(`Error al obtener token: ${error.message}`);
        // Si el error es de JSON, mostramos la respuesta cruda para depurar.
        if (error instanceof SyntaxError) {
            console.error("La respuesta del servidor no es un JSON válido. Contenido:", responseText);
        }
        await leaveCall();
        return;
      }
    }

    // --- DEBUG: Imprimir los valores antes de unirse al canal ---
    console.log("%c[DEBUG] Intentando unirse al canal con los siguientes datos:", "color: yellow; font-weight: bold;");
    console.log("App ID:", appId);
    console.log("Channel Name:", channelName);
    console.log("UID:", uid);
    console.log("Token:", token);
    if (!token || typeof token !== 'string' || token.length < 50) {
        console.error("¡EL TOKEN PARECE INVÁLIDO O ESTÁ VACÍO!");
        alert("Error de depuración: El token generado es inválido o está vacío. Revisa la consola.");
    }

    // --- 3.1. Crear pistas de audio y video, manejando errores de forma individual ---
    try {
      localTracks.audio = await AgoraRTC.createMicrophoneAudioTrack();
    } catch (e) {
      console.error("Fallo al crear la pista de audio:", e);
      alert("No se pudo acceder al micrófono. La llamada no puede continuar sin audio.");
      await leaveCall(); // Salir si el audio falla es crítico
      return;
    }

    try {
      localTracks.video = await AgoraRTC.createCameraVideoTrack();
    } catch (e) {
      console.error("Fallo al crear la pista de video:", e);
      // Si la cámara falla, no abortamos. Mostramos la imagen y continuamos solo con audio.
      localPlayerContainer.innerHTML = `<img src="../Assets/NoCamera.png" alt="Cámara no disponible">`;
      localTracks.video = null; // Aseguramos que la pista de video sea null
    }

    // --- 3.2. Unirse al canal ---
    await agoraClient.join(appId, channelName, token, uid);

    console.log("Unido al canal y pistas locales creadas.");

    // Mostrar video local solo si se creó correctamente
    if (localTracks.video) {
      localPlayerContainer.innerHTML = '';
      localTracks.video.play(localPlayerContainer);
    }

    // Publicar pistas locales
    // Filtramos las pistas que sean null (como el video si falló)
    const tracksToPublish = Object.values(localTracks).filter(track => track !== null);
    await agoraClient.publish(tracksToPublish);
    console.log("Pistas locales publicadas.");

    // --- 4. Asignar eventos a los botones de control (DESPUÉS de crear las pistas) ---
    const micBtn = document.getElementById('toggle-mic-btn');
    const camBtn = document.getElementById('toggle-cam-btn');
    const hangUpBtn = document.getElementById('hang-up-btn');

    hangUpBtn.addEventListener('click', leaveCall);

    micBtn.addEventListener('click', async () => {
      if (localTracks.audio) {
        const isMuted = localTracks.audio.muted;
        await localTracks.audio.setMuted(!isMuted);
        micBtn.classList.toggle('mic-muted', !isMuted);
        micBtn.innerHTML = !isMuted ? '🔇' : '🎤';
        micBtn.title = !isMuted ? "Activar Micrófono" : "Silenciar Micrófono";
      }
    });

    camBtn.addEventListener('click', async () => {
      if (localTracks.video) {
        const isEnabled = localTracks.video.enabled;
        await localTracks.video.setEnabled(!isEnabled);
        camBtn.classList.toggle('muted', !isEnabled);
        camBtn.innerHTML = !isEnabled ? '📸' : '📷';
        camBtn.title = !isEnabled ? "Activar Cámara" : "Apagar Cámara";
        
        // Mostrar/ocultar el video local
        if (isEnabled) {
          localPlayerContainer.innerHTML = `<img src="../Assets/NoCamera.png" alt="Cámara apagada">`;
        } else {
          localPlayerContainer.innerHTML = '';
          localTracks.video.play(localPlayerContainer);
        }
      }
    });

  } catch (error) {
    console.error("Error al iniciar la videollamada:", error);
    alert(`No se pudo iniciar la videollamada: ${error.message}. Revisa los permisos del navegador.`);
    await leaveCall();
  }
}