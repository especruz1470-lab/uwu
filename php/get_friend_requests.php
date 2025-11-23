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

    $query = "SELECT s.idSolicitud, u.nomUsuario AS nomUsuarioSolicitante
              FROM solicitudes_amistad s
              JOIN usuarios u ON s.idUsuarioSolicitante = u.idUsuario
              WHERE s.idUsuarioReceptor = :currentUserId";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':currentUserId', $currentUserId, PDO::PARAM_INT);
    $stmt->execute();

    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'requests' => $requests]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>