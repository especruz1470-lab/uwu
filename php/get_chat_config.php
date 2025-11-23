<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if (!isset($_SESSION['user_id']) || !isset($_GET['other_user_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];
$otherUserId = $_GET['other_user_id'];

// Ordenar los IDs para que la consulta sea consistente sin importar quién la inicie
$idUsuarioA = min($currentUserId, $otherUserId);
$idUsuarioB = max($currentUserId, $otherUserId);

try {
    $database = new Database();
    $db = $database->connect();

    $query = "SELECT cifradoActivo FROM chat_configuracion WHERE idUsuarioA = :idA AND idUsuarioB = :idB";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':idA', $idUsuarioA, PDO::PARAM_INT);
    $stmt->bindParam(':idB', $idUsuarioB, PDO::PARAM_INT);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no existe una configuración, por defecto es no cifrado (0)
    $isEncrypted = $result ? (bool)$result['cifradoActivo'] : false;

    echo json_encode(['success' => true, 'isEncrypted' => $isEncrypted]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>