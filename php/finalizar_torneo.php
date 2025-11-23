<?php
session_start();
header('Content-Type: application/json');

// --- FUNCIÓN DE DEBUG ---
// Esta función escribirá en un archivo de log para que podamos ver qué está pasando.
function debug_log($message) {
    $log_file = __DIR__ . '/debug_finalizar_torneo.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] " . print_r($message, true) . "\n", FILE_APPEND);
}

include_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa.']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
debug_log("--- Nueva Solicitud ---");
debug_log("Datos recibidos: " . json_encode($data));

if (!isset($data->id_torneo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
    exit();
}

$id_torneo = $data->id_torneo;

try {
    $database = new Database();
    $db = $database->connect();
    debug_log("Conexión a la base de datos exitosa.");
    $db->beginTransaction();
    debug_log("Transacción iniciada.");

    // 1. Obtener los IDs de los equipos y verificar que el torneo esté activo y listo para finalizar
    $query_equipos = "CALL sp_finalizar_torneo_get_datos(:id_torneo)";
    debug_log("Llamando a sp_finalizar_torneo_get_datos con id_torneo: " . $id_torneo);
    $stmt_equipos = $db->prepare($query_equipos);
    $stmt_equipos->bindParam(':id_torneo', $id_torneo, PDO::PARAM_INT);
    $stmt_equipos->execute();
    $equipos = $stmt_equipos->fetch(PDO::FETCH_ASSOC);
    $stmt_equipos->closeCursor(); // ¡SOLUCIÓN! Cierra el cursor anterior.
    debug_log("Resultado de sp_finalizar_torneo_get_datos: " . json_encode($equipos));

    if (!$equipos) {
        // No usamos throw para poder dar un mensaje más claro en el log.
        debug_log("Error: El torneo no está listo para finalizar o ya ha terminado. Puede que el contador no haya llegado a 20s o el estado ya sea 'finalizado'.");
        throw new Exception("El torneo no está listo para ser finalizado o ya ha terminado. Revisa el log.");
    }

    // 2. Decidir un ganador aleatoriamente
    $ganador_id = (rand(0, 1) == 0) ? $equipos['equipo_a_id'] : $equipos['equipo_b_id'];
    $puntos_ganados = $equipos['puntos_premio'];

    // Generar marcador aleatorio
    $goles_ganador = rand(1, 5);
    $goles_perdedor = rand(0, $goles_ganador - 1);

    $goles_a = ($ganador_id == $equipos['equipo_a_id']) ? $goles_ganador : $goles_perdedor;
    $goles_b = ($ganador_id == $equipos['equipo_b_id']) ? $goles_ganador : $goles_perdedor;

    // 3. Actualizar el torneo con el ganador
    $query_update_torneo = "CALL sp_finalizar_torneo_update(:id_torneo, :ganador_id, :goles_a, :goles_b)";
    debug_log("Llamando a sp_finalizar_torneo_update con ganador_id: " . $ganador_id . ", goles_a: " . $goles_a . ", goles_b: " . $goles_b);
    $stmt_update_torneo = $db->prepare($query_update_torneo);
    $stmt_update_torneo->bindParam(':id_torneo', $id_torneo, PDO::PARAM_INT);
    $stmt_update_torneo->bindParam(':ganador_id', $ganador_id, PDO::PARAM_INT);
    $stmt_update_torneo->bindParam(':goles_a', $goles_a, PDO::PARAM_INT);
    $stmt_update_torneo->bindParam(':goles_b', $goles_b, PDO::PARAM_INT);
    $stmt_update_torneo->execute();
    $stmt_update_torneo->closeCursor();

    // 4. Obtener todos los usuarios que votaron por el ganador
    $query_ganadores = "CALL sp_finalizar_torneo_get_ganadores(:id_torneo, :ganador_id)";
    debug_log("Llamando a sp_finalizar_torneo_get_ganadores con ganador_id: " . $ganador_id);
    $stmt_ganadores = $db->prepare($query_ganadores);
    $stmt_ganadores->bindParam(':id_torneo', $id_torneo, PDO::PARAM_INT);
    $stmt_ganadores->bindParam(':ganador_id', $ganador_id, PDO::PARAM_INT);
    $stmt_ganadores->execute();
    $usuarios_ganadores = $stmt_ganadores->fetchAll(PDO::FETCH_COLUMN);
    $stmt_ganadores->closeCursor(); // ¡SOLUCIÓN! Cierra el cursor.
    debug_log("Usuarios ganadores encontrados: " . json_encode($usuarios_ganadores));

    // 5. Asignar puntos a los ganadores
    if (count($usuarios_ganadores) > 0) {
        debug_log("Asignando " . $puntos_ganados . " puntos a los ganadores.");
        $query_puntos = "CALL sp_finalizar_torneo_asignar_puntos(:id_usuario, :puntos)";
        $stmt_puntos = $db->prepare($query_puntos);
        foreach ($usuarios_ganadores as $id_ganador) {
            debug_log("Asignando puntos al usuario: " . $id_ganador);
            $stmt_puntos->bindParam(':id_usuario', $id_ganador);
            $stmt_puntos->bindParam(':puntos', $puntos_ganados);
            $stmt_puntos->execute();
            $stmt_puntos->closeCursor(); // ¡SOLUCIÓN! Cierra el cursor en cada iteración.
        }
    } else {
        debug_log("No hay usuarios ganadores para asignar puntos.");
    }

    $db->commit();
    debug_log("Transacción completada (commit).");
    $response_data = ['success' => true, 'ganador_id' => $ganador_id, 'puntos_ganados' => $puntos_ganados, 'usuarios_ganadores' => $usuarios_ganadores, 'goles_a' => $goles_a, 'goles_b' => $goles_b];
    debug_log("Respuesta enviada: " . json_encode($response_data));
    echo json_encode($response_data);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    debug_log("!!! ERROR CAPTURADO !!!\nMensaje: " . $e->getMessage() . "\nTraza: " . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>