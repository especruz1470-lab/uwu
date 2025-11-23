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

if (!isset($_GET['other_user_id'])) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['success' => false, 'message' => 'Falta el ID del otro usuario.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];
$otherUserId = $_GET['other_user_id'];

try {
    $database = new Database();
    $db = $database->connect();

    // 2. Consulta para obtener la conversación
    $query = "SELECT idMensaje, idUsuarioEmisor, idUsuarioReceptor, mensaje_texto, es_cifrado,
                     imagen1_url, imagen2_url, imagen3_url, imagen4_url, video_url, fecha_envio
              FROM mensajes
              WHERE (idUsuarioEmisor = ? AND idUsuarioReceptor = ?)
                 OR (idUsuarioEmisor = ? AND idUsuarioReceptor = ?)
              ORDER BY fecha_envio ASC";

    $stmt = $db->prepare($query);
    // Usamos marcadores de posición anónimos (?) para máxima compatibilidad.
    // Debemos pasar un array con los valores en el orden exacto en que aparecen los '?' en la consulta.
    $stmt->execute([
        $currentUserId, // Primer ? (idUsuarioEmisor)
        $otherUserId,   // Segundo ? (idUsuarioReceptor)
        $otherUserId,   // Tercer ? (idUsuarioEmisor)
        $currentUserId  // Cuarto ? (idUsuarioReceptor)
    ]);

    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'messages' => $messages]);

} catch (PDOException $e) {
    // Capturamos cualquier error de la base de datos (conexión o consulta)
    http_response_code(500); // Error interno del servidor
    // En un entorno de producción, registrarías el error: error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // Captura otros errores generales
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocurrió un error inesperado.']);
    exit();
}
?>