<?php
/**
 * get_non_friends.php
 *
 * Este script obtiene y devuelve una lista de usuarios que no son amigos
 * del usuario actual y con los que no existe una solicitud de amistad pendiente.
 */

header('Content-Type: application/json');
session_start();

// Incluir la clase de la base de datos para ser consistentes con otros scripts
include_once 'Database.php';

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit;
}

$currentUserId = $_SESSION['user_id'];
$response = ['success' => false, 'users' => [], 'message' => ''];

try {
    $database = new Database();
    $pdo = $database->connect();

    // Llamar al procedimiento almacenado que contiene toda la lógica.
    $sql = "CALL sp_get_non_friends(:currentUserId)";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':currentUserId', $currentUserId, PDO::PARAM_INT);
    $stmt->execute();

    // Convertir el valor de 'solicitud_pendiente' a booleano para que sea más fácil de usar en JS.
    $users = array_map(function($user) {
        $user['solicitud_pendiente'] = (bool)$user['solicitud_pendiente'];
        return $user;
    }, $stmt->fetchAll(PDO::FETCH_ASSOC));

    $response['users'] = $users;
    $response['success'] = true;

} catch (PDOException $e) {
    $response['message'] = 'Error de base de datos: ' . $e->getMessage();
}

echo json_encode($response);
?>