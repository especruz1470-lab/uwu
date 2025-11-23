<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];
$tipoActividad = $_POST['tipoActividad'] ?? '';
$idGrupo = $_POST['idGrupo'] ?? null;

if (empty($tipoActividad)) {
    echo json_encode(['success' => false, 'message' => 'Tipo de actividad no especificado.']);
    exit();
}

try {
    $database = new Database();
    $db = $database->connect();

    // Llamada al procedimiento almacenado que maneja toda la lógica
    $query = "CALL sp_actualizar_progreso_tarea(:idUsuario, :tipoActividad, :idGrupo)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':idUsuario', $currentUserId, PDO::PARAM_INT);
    $stmt->bindParam(':tipoActividad', $tipoActividad, PDO::PARAM_STR);
    if ($idGrupo) {
        $stmt->bindParam(':idGrupo', $idGrupo, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(':idGrupo', null, PDO::PARAM_NULL);
    }
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Progreso de tarea actualizado.']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar progreso: ' . $e->getMessage()]);
}
?>