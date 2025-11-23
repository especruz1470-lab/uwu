<?php
session_start();

header('Content-Type: application/json');

// Incluimos la conexión a la base de datos.
include_once 'Database.php';

// Verificamos si hay un usuario en la sesión.
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'message' => 'No hay una sesión activa.']);
    exit();
}

$current_user_id = $_SESSION['user_id'];

$database = new Database();
$db = $database->connect();

if (!$db) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.']);
    exit();
}

// Consulta para obtener todos los usuarios EXCEPTO el usuario actual.
$query = 'SELECT idUsuario, nomUsuario, fotoPerfil FROM usuarios WHERE idUsuario != :current_user_id ORDER BY nomUsuario ASC';
$stmt = $db->prepare($query);
$stmt->bindParam(':current_user_id', $current_user_id);
$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'users' => $users]);
?>