<?php
session_start();
header('Content-Type: application/json');

require 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit;
}

$current_user_id = $_SESSION['user_id'];
$database = new Database();
$db = $database->connect();

try {
    // Obtener puntos del usuario
    $stmt_puntos = $db->prepare("SELECT puntos FROM puntuaciones_usuarios WHERE id_usuario = ?");
    $stmt_puntos->execute([$current_user_id]);
    $puntos = $stmt_puntos->fetchColumn();

    // Obtener copas adquiridas por el usuario
    $stmt_copas = $db->prepare("SELECT id_copa FROM copas_usuarios WHERE id_usuario = ?");
    $stmt_copas->execute([$current_user_id]);
    $copas_adquiridas = $stmt_copas->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'puntos' => $puntos !== false ? (int)$puntos : 0,
        'copas_adquiridas' => $copas_adquiridas
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>