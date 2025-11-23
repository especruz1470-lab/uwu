document.addEventListener("DOMContentLoaded", async () => {
    const userData = await loadCurrentUserData();
    if (!userData) return;

    initializeTopbarMenus();
    window.notificationManager = await initializeNotifications();
    window.chatManager = initializeChat({
        chatListContainerId: 'chat-list-container',
        mainChatSectionId: 'chat-section-main',
        pageContentSectionId: 'nivel-container',
        currentUserId: userData.id,
        currentUserAvatar: userData.profilePic
    });

    // Recargar la lista de chats y notificaciones cuando la ventana/pestaña recupera el foco
    window.addEventListener('focus', () => {
        if (window.chatManager) window.chatManager.loadChatList();
        if (window.notificationManager) window.notificationManager.loadFriendRequests();
    });

    await loadUserLevel();
});

async function loadUserLevel() {
    try {
        const response = await fetch('../php/get_user_level.php');
        const data = await response.json();

        if (data.success) {
            updateLevelUI(data.puntos, data.rango);
        } else {
            console.error('Error al obtener el nivel del usuario:', data.message);
        }
    } catch (error) {
        console.error('Error de conexión al obtener el nivel:', error);
    }
}

function updateLevelUI(puntos, rango) {
    const rangos = {
        plata: { min: 0, max: 100, nombre: 'PLATA', imagen: 'Plata.png' },
        oro: { min: 101, max: 300, nombre: 'ORO', imagen: 'Oro.png' },
        rubi: { min: 301, max: 700, nombre: 'RUBÍ', imagen: 'Rubi.png' },
        diamante: { min: 701, max: Infinity, nombre: 'DIAMANTE', imagen: 'Diamante.png' }
    };

    const rangoActual = rangos[rango] || rangos.plata;

    // Elementos de la UI
    const currentLevelBadge = document.getElementById('current-level-badge');
    const currentLevelImage = document.getElementById('current-level-image');
    const currentLevelName = document.getElementById('current-level-name');
    const progressFill = document.getElementById('progress-fill');
    const demotionPoints = document.getElementById('demotion-points');
    const currentPoints = document.getElementById('current-points');
    const promotionPoints = document.getElementById('promotion-points');

    // Actualizar insignia actual
    if (currentLevelBadge) {
        // Limpiar clases de rango anteriores
        Object.keys(rangos).forEach(r => currentLevelBadge.classList.remove(r));
        currentLevelBadge.classList.add(rango);
    }
    if (currentLevelImage) {
        currentLevelImage.src = `../Assets/${rangoActual.imagen}`;
        currentLevelImage.alt = rangoActual.nombre;
    }
    if (currentLevelName) {
        currentLevelName.textContent = rangoActual.nombre;
    }

    // Calcular y actualizar barra de progreso
    const puntosParaDescenso = rangoActual.min;
    const puntosParaAscenso = rangoActual.max;
    
    let progreso = 0;
    if (puntosParaAscenso !== Infinity) {
        const rangoTotal = puntosParaAscenso - puntosParaDescenso;
        const progresoEnRango = puntos - puntosParaDescenso;
        progreso = (progresoEnRango / rangoTotal) * 100;
    } else {
        // Si es el rango máximo, la barra está llena
        progreso = 100;
    }

    if (progressFill) {
        progressFill.style.width = `${Math.max(0, Math.min(100, progreso))}%`;
    }

    // Actualizar textos de puntos
    if (demotionPoints) {
        demotionPoints.textContent = `${puntosParaDescenso} pts`;
    }
    if (currentPoints) {
        currentPoints.textContent = `${puntos} pts`;
    }
    if (promotionPoints) {
        promotionPoints.textContent = puntosParaAscenso === Infinity ? 'MAX' : `${puntosParaAscenso} pts`;
    }
}