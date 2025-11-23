<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa.']);
    exit();
}

define('MAX_ACTIVE_TOURNAMENTS', 5);

try {
    $database = new Database();
    $db = $database->connect();

    // 1. Contar cuántos torneos están activos.
    $query_count = "SELECT COUNT(*) as active_count FROM torneos_simulados WHERE estado = 'activo'";
    $stmt_count = $db->prepare($query_count);
    $stmt_count->execute();
    $active_count = (int)$stmt_count->fetch(PDO::FETCH_ASSOC)['active_count'];

    $tournaments_to_create = MAX_ACTIVE_TOURNAMENTS - $active_count;

    // 2. Si faltan torneos, crearlos.
    if ($tournaments_to_create > 0) {
        for ($i = 0; $i < $tournaments_to_create; $i++) {
            // Seleccionar dos países aleatorios distintos que no estén jugando ya en un torneo activo
            $query_paises = "
                SELECT id FROM paises 
                WHERE id NOT IN (
                    SELECT equipo_a_id FROM torneos_simulados WHERE estado = 'activo'
                    UNION
                    SELECT equipo_b_id FROM torneos_simulados WHERE estado = 'activo'
                )
                ORDER BY RAND() 
                LIMIT 2";
            
            $stmt_paises = $db->prepare($query_paises);
            $stmt_paises->execute();
            $paises = $stmt_paises->fetchAll(PDO::FETCH_ASSOC);

            if (count($paises) < 2) {
                // No hay suficientes países únicos disponibles, no se pueden crear más torneos.
                break; 
            }

            $equipo_a_id = $paises[0]['id'];
            $equipo_b_id = $paises[1]['id'];

            // Insertar el nuevo torneo
            $puntos_premio = rand(5, 15);
            $query_insert = "INSERT INTO torneos_simulados (equipo_a_id, equipo_b_id, puntos_premio) VALUES (:equipo_a, :equipo_b, :puntos)";
            $stmt_insert = $db->prepare($query_insert);
            $stmt_insert->bindParam(':equipo_a', $equipo_a_id);
            $stmt_insert->bindParam(':equipo_b', $equipo_b_id);
            $stmt_insert->bindParam(':puntos', $puntos_premio);
            $stmt_insert->execute();
        }
    }

    // 3. Devolver todos los torneos activos.
    $query_get_all = "SELECT 
                          t.id,
                          t.puntos_premio,
                          t.countdown_start_time,
                          t.estado,
                          pa.id AS id_a, pa.nombre AS nombre_a, pa.bandera_url AS bandera_a,
                          pb.id AS id_b, pb.nombre AS nombre_b, pb.bandera_url AS bandera_b,
                          (SELECT COUNT(*) FROM votos_usuarios_torneo WHERE id_torneo = t.id AND id_equipo_votado = pa.id) as votos_a,
                          (SELECT COUNT(*) FROM votos_usuarios_torneo WHERE id_torneo = t.id AND id_equipo_votado = pb.id) as votos_b,
                          (SELECT id_equipo_votado FROM votos_usuarios_torneo WHERE id_torneo = t.id AND id_usuario = :user_id) as voto_usuario
                      FROM torneos_simulados t
                      JOIN paises pa ON t.equipo_a_id = pa.id
                      JOIN paises pb ON t.equipo_b_id = pb.id
                      WHERE t.estado = 'activo'
                      ORDER BY t.fecha_creacion ASC";
                      
    $stmt_get_all = $db->prepare($query_get_all);
    $stmt_get_all->bindParam(':user_id', $_SESSION['user_id']);
    $stmt_get_all->execute();
    $active_tournaments = $stmt_get_all->fetchAll(PDO::FETCH_ASSOC);

    // 4. Devolver los últimos 5 torneos finalizados.
    $query_finalized = "SELECT 
                            t.id, t.puntos_premio, t.goles_a, t.goles_b, t.equipo_ganador_id,
                            pa.id AS id_a, pa.nombre AS nombre_a, pa.bandera_url AS bandera_a,
                            pb.id AS id_b, pb.nombre AS nombre_b, pb.bandera_url AS bandera_b,
                            (SELECT id_equipo_votado FROM votos_usuarios_torneo WHERE id_torneo = t.id AND id_usuario = :user_id) as voto_usuario
                        FROM torneos_simulados t
                        JOIN paises pa ON t.equipo_a_id = pa.id
                        JOIN paises pb ON t.equipo_b_id = pb.id
                        WHERE t.estado = 'finalizado'
                        ORDER BY t.fecha_finalizacion DESC
                        LIMIT 5";

    $stmt_finalized = $db->prepare($query_finalized);
    $stmt_finalized->bindParam(':user_id', $_SESSION['user_id']);
    $stmt_finalized->execute();
    $finalized_tournaments = $stmt_finalized->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'active_tournaments' => $active_tournaments, 'finalized_tournaments' => $finalized_tournaments]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>