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

    // Llamada al procedimiento almacenado para obtener amigos
    $query = "CALL sp_get_friends(:currentUserId)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':currentUserId', $currentUserId, PDO::PARAM_INT);
    $stmt->execute();

    $friends = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'users' => $friends]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>