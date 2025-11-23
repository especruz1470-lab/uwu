<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

// 1. Verificar sesión y datos de entrada
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'message' => 'No hay una sesión activa.']);
    exit();
}

if (!isset($_GET['other_user_id']) || !isset($_GET['last_message_id'])) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros requeridos.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];
$otherUserId = $_GET['other_user_id'];
$lastMessageId = (int)$_GET['last_message_id']; // El ID del último mensaje que el cliente tiene

try {
    $database = new Database();
    $db = $database->connect();

    // 2. Consulta para obtener solo los mensajes NUEVOS
    $query = "SELECT idMensaje, idUsuarioEmisor, idUsuarioReceptor, mensaje_texto, es_cifrado,
                     imagen1_url, imagen2_url, imagen3_url, imagen4_url, video_url, fecha_envio
              FROM mensajes

              WHERE 
                ( (idUsuarioEmisor = ? AND idUsuarioReceptor = ?) OR (idUsuarioEmisor = ? AND idUsuarioReceptor = ?) )
                AND idMensaje > ?
              ORDER BY fecha_envio ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([
        $currentUserId,
        $otherUserId,
        $otherUserId,
        $currentUserId,
        $lastMessageId // El parámetro clave para buscar solo los nuevos
    ]);

    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'messages' => $messages]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    exit();
}
?>