<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa.']);
    exit();
}

try {
    $database = new Database();
    $db = $database->connect();

    // 1. Buscar si ya hay un torneo activo
    $query_activo = "SELECT t.id, 
                            pa.nombre AS nombre_a, pa.bandera_url AS bandera_a, pa.id AS id_a,
                            pb.nombre AS nombre_b, pb.bandera_url AS bandera_b, pb.id AS id_b
                     FROM torneos_simulados t
                     JOIN paises pa ON t.equipo_a_id = pa.id
                     JOIN paises pb ON t.equipo_b_id = pb.id
                     WHERE t.estado = 'activo' 
                     ORDER BY t.fecha_creacion DESC 
                     LIMIT 1";
    $stmt_activo = $db->prepare($query_activo);
    $stmt_activo->execute();
    $torneo_existente = $stmt_activo->fetch(PDO::FETCH_ASSOC);

    if ($torneo_existente) {
        echo json_encode(['success' => true, 'torneo' => $torneo_existente]);
        exit();
    }

    // 2. Si no hay torneo activo, crear uno nuevo
    // Seleccionar dos países aleatorios distintos
    $query_paises = "SELECT id, nombre, bandera_url FROM paises ORDER BY RAND() LIMIT 2";
    $stmt_paises = $db->prepare($query_paises);
    $stmt_paises->execute();
    $paises = $stmt_paises->fetchAll(PDO::FETCH_ASSOC);

    if (count($paises) < 2) {
        throw new Exception("No hay suficientes países en la base de datos para crear un torneo.");
    }

    $equipo_a = $paises[0];
    $equipo_b = $paises[1];

    // Insertar el nuevo torneo
    $query_insert = "INSERT INTO torneos_simulados (equipo_a_id, equipo_b_id) VALUES (:equipo_a, :equipo_b)";
    $stmt_insert = $db->prepare($query_insert);
    $stmt_insert->bindParam(':equipo_a', $equipo_a['id']);
    $stmt_insert->bindParam(':equipo_b', $equipo_b['id']);
    $stmt_insert->execute();

    $id_torneo = $db->lastInsertId();

    echo json_encode(['success' => true, 'torneo' => [
        'id' => $id_torneo,
        'nombre_a' => $equipo_a['nombre'],
        'bandera_a' => $equipo_a['bandera_url'],
        'id_a' => $equipo_a['id'],
        'nombre_b' => $equipo_b['nombre'],
        'bandera_b' => $equipo_b['bandera_url'],
        'id_b' => $equipo_b['id']
    ]]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
