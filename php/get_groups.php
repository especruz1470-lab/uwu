<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay una sesión activa.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];

try {
    $database = new Database();
    $db = $database->connect();

    // Consulta para obtener los grupos donde el usuario actual es miembro
    $query = "SELECT g.idGrupo, g.nombreGrupo, g.fotoGrupo_url 
              FROM grupos g
              JOIN grupo_miembros gm ON g.idGrupo = gm.idGrupo
              WHERE gm.idUsuario = :currentUserId
              ORDER BY g.nombreGrupo ASC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':currentUserId', $currentUserId, PDO::PARAM_INT);
    $stmt->execute();

    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'groups' => $groups]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>