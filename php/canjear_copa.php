<?php
session_start();
header('Content-Type: application/json');

require 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$current_user_id = $_SESSION['user_id'];
$id_copa = $data['id_copa'] ?? null;
$precio_copa = $data['precio'] ?? null;

if (!$id_copa || !is_numeric($precio_copa)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
    exit;
}

$database = new Database();
$db = $database->connect();

// Iniciar transacción para asegurar la integridad de los datos
$db->beginTransaction();

try {
    // 1. Verificar si el usuario ya tiene la copa
    $stmt = $db->prepare("SELECT COUNT(*) FROM copas_usuarios WHERE id_usuario = ? AND id_copa = ?");
    $stmt->execute([$current_user_id, $id_copa]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('Ya has adquirido esta copa.');
    }

    // 2. Obtener los puntos actuales del usuario y verificar si tiene suficientes
    $stmt = $db->prepare("SELECT puntos FROM puntuaciones_usuarios WHERE id_usuario = ?");
    $stmt->execute([$current_user_id]);
    $puntos_actuales = $stmt->fetchColumn();

    if ($puntos_actuales === false || $puntos_actuales < $precio_copa) {
        throw new Exception('No tienes suficientes puntos para comprar esta copa.');
    }

    // 3. Restar los puntos
    $nuevos_puntos = $puntos_actuales - $precio_copa;
    $stmt = $db->prepare("UPDATE puntuaciones_usuarios SET puntos = ? WHERE id_usuario = ?");
    $stmt->execute([$nuevos_puntos, $current_user_id]);

    // 4. Registrar la copa como adquirida
    $stmt = $db->prepare("INSERT INTO copas_usuarios (id_usuario, id_copa) VALUES (?, ?)");
    $stmt->execute([$current_user_id, $id_copa]);

    // 5. Llamar al SP para actualizar el rango del usuario
    $stmt = $db->prepare("CALL actualizar_rango_usuario(?)");
    $stmt->execute([$current_user_id]);

    // Si todo fue bien, confirmar la transacción
    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => '¡Copa canjeada con éxito!',
        'nuevos_puntos' => $nuevos_puntos
    ]);

} catch (Exception $e) {
    // Si algo falla, revertir todos los cambios
    $db->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>