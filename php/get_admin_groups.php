<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'No hay una sesión activa.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];

try {
    $database = new Database();
    $db = $database->connect();

    // Llamada al procedimiento almacenado
    $query = "CALL sp_get_admin_groups(:userId)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':userId', $currentUserId, PDO::PARAM_INT);
    $stmt->execute();

    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'groups' => $groups]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al obtener los grupos: ' . $e->getMessage()]);
}
?>