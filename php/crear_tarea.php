<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];
$nombreTarea = $_POST['nombre'] ?? '';
$idGrupo = $_POST['grupo'] ?? '';
$tipoActividad = $_POST['actividad'] ?? '';

if (empty($nombreTarea) || empty($idGrupo) || empty($tipoActividad)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos para crear la tarea.']);
    exit();
}

try {
    $database = new Database();
    $db = $database->connect();

    // Llamada al procedimiento almacenado que ya incluye la validación
    $query = "CALL sp_crear_tarea(:nombre, :idGrupo, :tipoActividad, :idCreador)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':nombre', $nombreTarea);
    $stmt->bindParam(':idGrupo', $idGrupo, PDO::PARAM_INT);
    $stmt->bindParam(':tipoActividad', $tipoActividad);
    $stmt->bindParam(':idCreador', $currentUserId, PDO::PARAM_INT);

    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Tarea creada exitosamente.']);
} catch (Exception $e) {
    // Captura el error personalizado del SP
    if ($e->getCode() == '45000') {
        http_response_code(403); // Forbidden
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit();
    }
    echo json_encode(['success' => false, 'message' => 'Error al crear la tarea: ' . $e->getMessage()]);
}
?>