<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay una sesión activa.']);
    exit();
}

if (!isset($_GET['group_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta el ID del grupo.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];
$groupId = $_GET['group_id'];

$database = new Database();
$db = $database->connect();

try {
    // 1. Verificar si el usuario es miembro del grupo
    $query_check = "SELECT 1 FROM grupo_miembros WHERE idGrupo = :idGrupo AND idUsuario = :idUsuario";
    $stmt_check = $db->prepare($query_check);
    $stmt_check->bindParam(':idGrupo', $groupId, PDO::PARAM_INT);
    $stmt_check->bindParam(':idUsuario', $currentUserId, PDO::PARAM_INT);
    $stmt_check->execute();

    if ($stmt_check->rowCount() == 0) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'No tienes permiso para ver este grupo.']);
        exit();
    }

    // 2. Obtener la lista de miembros del grupo
    $query_members = "SELECT u.idUsuario, u.nomUsuario FROM usuarios u JOIN grupo_miembros gm ON u.idUsuario = gm.idUsuario WHERE gm.idGrupo = :idGrupo";
    $stmt_members = $db->prepare($query_members);
    $stmt_members->bindParam(':idGrupo', $groupId, PDO::PARAM_INT);
    $stmt_members->execute();
    $members = $stmt_members->fetchAll(PDO::FETCH_ASSOC);

    // 3. Obtener los últimos 50 mensajes del grupo
    $query_messages = "SELECT mg.*, u.nomUsuario AS nombreEmisor
                       FROM mensajes_grupo mg
                       JOIN usuarios u ON mg.idUsuarioEmisor = u.idUsuario
                       WHERE mg.idGrupo = :idGrupo
                       ORDER BY mg.fecha_envio ASC
                       LIMIT 50";
    $stmt_messages = $db->prepare($query_messages);
    $stmt_messages->bindParam(':idGrupo', $groupId, PDO::PARAM_INT);
    $stmt_messages->execute();
    $messages = $stmt_messages->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'members' => $members,
        'messages' => $messages
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>