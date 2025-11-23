document.addEventListener("DOMContentLoaded", async () => {
  // Inicializamos los módulos
  // La carga de datos de usuario y la inicialización de menús se mueven a app.js
  const userData = await loadCurrentUserData();
  if (!userData) return; // Detener si no se cargan los datos del usuario

  initializeTopbarMenus();

  window.notificationManager = await initializeNotifications();
  window.chatManager = initializeChat({
    chatListContainerId: 'chat-list-container',
    mainChatSectionId: 'chat-section-main',
    pageContentSectionId: 'tournament-section', // ID del contenido principal de esta página
    currentUserId: userData.id,
    currentUserAvatar: userData.profilePic
  });

  // Recargar la lista de chats y notificaciones cuando la ventana/pestaña recupera el foco
  window.addEventListener('focus', () => {
    if (window.chatManager) window.chatManager.loadChatList();
    if (window.notificationManager) window.notificationManager.loadFriendRequests();
  });

  console.log("Página Principal cargada correctamente");

  /**
   * Inicializa toda la funcionalidad de la sección del torneo, incluyendo
   * votaciones, estadísticas y tabla de líderes.
   */
  function initializeTournament() {
    const tournamentSection = document.getElementById('tournament-section');
    if (!tournamentSection) {
      return;
    }

    const matchesGrid = tournamentSection.querySelector('.matches-grid');
    const finalizedMatchesGrid = document.getElementById('finalized-matches-grid');
    let activeTimers = {}; // Para gestionar los contadores de cada partido

    async function loadAndDisplayTournament() {
      try {
        const response = await fetch('../php/get_active_tournaments.php');
        const data = await response.json();

        if (data.success && data.active_tournaments.length > 0) {
          matchesGrid.innerHTML = data.active_tournaments.map(torneo => {
            const totalVotes = parseInt(torneo.votos_a) + parseInt(torneo.votos_b);
            const percentageA = totalVotes > 0 ? (torneo.votos_a / totalVotes) * 100 : 50;
            const percentageB = 100 - percentageA;
            const countdownHTML = `<div class="match-timer" style="display: none;"></div>`;
            const prizeHTML = `<div class="match-prize">🏆 ${torneo.puntos_premio} Puntos</div>`;

            return `
              <div class="match-card" data-match-id="${torneo.id}">
                <div class="match-header-info">${prizeHTML}${countdownHTML}</div>
                <div class="match-info">
                  <div class="match-date">TORNEO ACTIVO</div>
                  <div class="match-location">¡Vota por tu favorito!</div>
                </div>
                <div class="teams-container">
                  <div class="team" data-team-id="${torneo.id_a}">
                    <div class="team-flag"><img src="../${torneo.bandera_a}" alt="${torneo.nombre_a}" class="team-flag-img"></div>
                    <div class="team-name">${torneo.nombre_a}</div>
                  </div>
                  <div class="vs-divider">VS</div>
                  <div class="team" data-team-id="${torneo.id_b}">
                    <div class="team-flag"><img src="../${torneo.bandera_b}" alt="${torneo.nombre_b}" class="team-flag-img"></div>
                    <div class="team-name">${torneo.nombre_b}</div>
                  </div>
                </div>
                <div class="vote-buttons">
                  <button class="vote-btn ${torneo.voto_usuario == torneo.id_a ? 'voted' : ''}" data-team-id="${torneo.id_a}" ${torneo.voto_usuario ? 'disabled' : ''}>Votar por ${torneo.nombre_a}</button>
                  <button class="vote-btn ${torneo.voto_usuario == torneo.id_b ? 'voted' : ''}" data-team-id="${torneo.id_b}" ${torneo.voto_usuario ? 'disabled' : ''}>Votar por ${torneo.nombre_b}</button>
                </div>
                <div class="match-stats">
                  <div class="stats-bar">
                    <div style="width: ${percentageA}%"></div>
                    <div style="width: ${percentageB}%"></div>
                  </div>
                  <div class="total-votes">Total: <span class="total-count">${totalVotes}</span> votos</div>
                </div>
              </div>
            `;
          }).join('');

          // Iniciar contadores para los torneos que ya lo tienen activo
          data.active_tournaments.forEach(torneo => {
            if (torneo.countdown_start_time) startCountdown(torneo.id, torneo.countdown_start_time);
          });          
        } else {
          matchesGrid.innerHTML = '<p class="no-tournaments-msg">No hay torneos activos en este momento. Se creará uno nuevo pronto...</p>';
          // Si no hay torneos, intentar recargar en unos segundos
          setTimeout(loadAndDisplayTournament, 5000);
        }

        // Renderizar partidos finalizados
        if (data.success && data.finalized_tournaments.length > 0) {
          finalizedMatchesGrid.innerHTML = data.finalized_tournaments.map(torneo => {
            const userVotedForWinner = torneo.voto_usuario && torneo.voto_usuario == torneo.equipo_ganador_id;
            let resultMessageHTML = '';

            if (torneo.voto_usuario) {
              const messageText = userVotedForWinner ? `VOTACIÓN GANADA (+${torneo.puntos_premio} Puntos)` : 'VOTACIÓN PERDIDA';
              const messageClass = userVotedForWinner ? 'result-win' : 'result-loss';
              resultMessageHTML = `<div class="match-result-message ${messageClass}">${messageText}</div>`;
            } else {
              resultMessageHTML = `<div class="vote-buttons"><button class="vote-btn" disabled>No votaste</button></div>`;
            }

            return `
              <div class="match-card finalized" data-match-id="${torneo.id}">
                <div class="match-header-info">
                    <div class="match-prize">🏆 ${torneo.puntos_premio} Puntos</div>
                    <div class="match-timer finished"><strong>FINALIZADO</strong></div>
                </div>
                <div class="match-info">
                  <div class="match-date">TORNEO FINALIZADO</div>
                </div>
                <div class="teams-container">
                  <div class="team ${torneo.equipo_ganador_id == torneo.id_a ? 'winner-animation' : ''}" data-team-id="${torneo.id_a}">
                    <div class="team-flag"><img src="../${torneo.bandera_a}" alt="${torneo.nombre_a}" class="team-flag-img"></div>
                    <div class="team-name">${torneo.nombre_a}</div>
                  </div>
                  <div class="vs-divider"><span class="final-score">${torneo.goles_a} - ${torneo.goles_b}</span></div>
                  <div class="team ${torneo.equipo_ganador_id == torneo.id_b ? 'winner-animation' : ''}" data-team-id="${torneo.id_b}">
                    <div class="team-flag"><img src="../${torneo.bandera_b}" alt="${torneo.nombre_b}" class="team-flag-img"></div>
                    <div class="team-name">${torneo.nombre_b}</div>
                  </div>
                </div>
                ${resultMessageHTML}
              </div>
            `;
          }).join('');
        } else {
          if (finalizedMatchesGrid.children.length === 0 || 
              (finalizedMatchesGrid.children.length === 1 && finalizedMatchesGrid.firstElementChild.classList.contains('no-tournaments-msg'))) {
            finalizedMatchesGrid.innerHTML = '<p class="no-tournaments-msg">Aún no hay partidos finalizados.</p>';
          }
        }
      } catch (error) {
        console.error('Error al cargar el torneo:', error);
        matchesGrid.innerHTML = '<p class="no-tournaments-msg">Error al cargar los torneos. Inténtalo de nuevo.</p>';
      }
    }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast-notification show ${isError ? 'error' : ''}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    matchesGrid.addEventListener('click', async (event) => {
      const voteButton = event.target.closest('.vote-btn');
      if (!voteButton || voteButton.disabled) return;
      
      const matchCard = voteButton.closest('.match-card');
      const tournamentId = matchCard.dataset.matchId;
      const teamId = voteButton.dataset.teamId;

      // Deshabilitar ambos botones para prevenir votos múltiples mientras se procesa
      matchCard.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
      });

      try {
        const response = await fetch('../php/registrar_voto_simulador.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_torneo: tournamentId, id_equipo_votado: teamId })
        });
        const result = await response.json();

        if (result.success) {
          // Notificar al backend para actualizar la tarea de votar
          const taskData = new FormData();
          taskData.append('tipoActividad', 'vote');
          fetch('../php/actualizar_progreso_tarea.php', { method: 'POST', body: taskData })
            .then(() => {
              // Disparamos el evento para que la página de tareas también se actualice.
              window.dispatchEvent(new CustomEvent('task-progress-updated'));
            });

          // Si el voto que acabamos de hacer inició la cuenta atrás, la mostramos
          if (result.countdown_started) {
            startCountdown(tournamentId, new Date().toISOString());
            showToast('¡Voto registrado! La simulación ha comenzado.');
          } else {
            showToast('¡Voto registrado! Se necesitan 2 votos para iniciar la simulación.');
          }
          // Recargamos la lista de torneos para reflejar el voto guardado.
          loadAndDisplayTournament();
        } else {
          showToast(`Error al votar: ${result.message}`, true);
          loadAndDisplayTournament(); // Recargar para restaurar los botones
        }
      } catch (error) {
        console.error('Error al registrar el voto:', error);
        showToast('Error de conexión al registrar el voto.', true);
        loadAndDisplayTournament(); // Recargar para restaurar los botones
      }
    });


    function startCountdown(tournamentId, startTime) {
      const matchCard = matchesGrid.querySelector(`.match-card[data-match-id="${tournamentId}"]`);
      if (!matchCard || activeTimers[tournamentId]) return;

      const countdownElement = matchCard.querySelector('.match-timer');
      countdownElement.style.display = 'block';

      const endTime = new Date(startTime).getTime() + 20000; // 20 segundos desde que se guardó en la BD

      const timer = setInterval(async () => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance <= 0) {
          clearInterval(timer);
          delete activeTimers[tournamentId];
          countdownElement.innerHTML = "Finalizando...";
          
          // Llamar al backend para finalizar el torneo
          try {
            const response = await fetch('../php/finalizar_torneo.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_torneo: tournamentId })
            });
            const result = await response.json();
            if (result.success) {
              handleSimulationResult(tournamentId, result);
            } else {
              countdownElement.innerHTML = "Error al finalizar";
            }
          } catch (error) {
            console.error("Error al finalizar torneo:", error);
            countdownElement.innerHTML = "Error de red";
          }

        } else {
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          countdownElement.innerHTML = `El partido termina en: <strong>${seconds}s</strong>`;
        }
      }, 1000);

      activeTimers[tournamentId] = timer;
    }

    function handleSimulationResult(tournamentId, result) {
      const { ganador_id, puntos_ganados, usuarios_ganadores, goles_a, goles_b } = result;
      const matchCard = tournamentSection.querySelector(`.match-card[data-match-id="${tournamentId}"]`);
      if (!matchCard) return;

      const timerElement = matchCard.querySelector('.match-timer');
      timerElement.innerHTML = `<strong>FINALIZADO</strong>`;
      timerElement.classList.add('finished');

      const winnerElement = matchCard.querySelector(`.team[data-team-id="${ganador_id}"]`);
      const teamAElement = matchCard.querySelector('.team[data-team-id]:first-child');
      const teamBElement = matchCard.querySelector('.team[data-team-id]:last-child');

      // Añadir clase para estilos de finalizado y mover la tarjeta
      matchCard.classList.add('finalized');
      const finalizedGrid = document.getElementById('finalized-matches-grid');
      if (finalizedGrid.querySelector('.no-tournaments-msg')) {
        finalizedGrid.innerHTML = ''; // Limpiar mensaje de "no hay partidos"
      }
      finalizedGrid.prepend(matchCard);

      // Mostrar el marcador final en el divisor "VS"
      const vsDivider = matchCard.querySelector('.vs-divider');
      if (vsDivider) {
        vsDivider.innerHTML = `<span class="final-score">${goles_a} - ${goles_b}</span>`;
      }

      const resultMessageContainer = document.createElement('div');
      resultMessageContainer.className = 'match-result-message';
      
      if (result.voto_usuario) { // Solo mostrar si el usuario votó
        const userVotedForWinner = usuarios_ganadores.includes(userData.id);
        resultMessageContainer.textContent = userVotedForWinner ? `VOTACIÓN GANADA (+${puntos_ganados} Puntos)` : 'VOTACIÓN PERDIDA';
        resultMessageContainer.classList.add(userVotedForWinner ? 'result-win' : 'result-loss');
        matchCard.querySelector('.vote-buttons').replaceWith(resultMessageContainer);

        if (userVotedForWinner) {
            createTournamentConfetti(document.body, 100); // Confeti por toda la pantalla
        }
      }

      // Desactivar botones y mostrar resultado
      matchCard.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.background = '#555';
      });
      winnerElement.classList.add('winner-animation');
    }
  
    loadAndDisplayTournament();
    console.log("⚽ Sistema de Torneo cargado correctamente");
  }

  initializeTournament();
});