<?php
session_start();
header('Content-Type: application/json');

include_once 'Database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay una sesión activa.']);
    exit();
}

$currentUserId = $_SESSION['user_id'];

// --- Validación de Datos ---
$groupName = isset($_POST['group_name']) ? trim($_POST['group_name']) : '';
$members = isset($_POST['members']) ? $_POST['members'] : [];

if (empty($groupName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El nombre del grupo es obligatorio.']);
    exit();
}

// La regla es 3 o más personas en total (creador + 2 o más amigos)
if (count($members) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Debes seleccionar al menos 2 amigos para crear un grupo.']);
    exit();
}

$imageUrl = null;

// --- Manejo de la subida de imagen ---
if (isset($_FILES['group_image']) && $_FILES['group_image']['error'] == 0) {
    $uploadDir = '../uploads/group_pics/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $fileType = mime_content_type($_FILES['group_image']['tmp_name']);

    if (in_array($fileType, $allowedTypes)) {
        $fileName = uniqid('group_', true) . '.' . pathinfo($_FILES['group_image']['name'], PATHINFO_EXTENSION);
        $uploadPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['group_image']['tmp_name'], $uploadPath)) {
            // Guardamos la ruta relativa para usarla en el HTML
            $imageUrl = 'uploads/group_pics/' . $fileName;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al mover la imagen subida.']);
            exit();
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipo de archivo no permitido. Solo se aceptan JPG, PNG y GIF.']);
        exit();
    }
}

$database = new Database();
$db = $database->connect();

try {
    $db->beginTransaction();

    // 1. Insertar el grupo en la tabla `grupos`
    $query_group = "INSERT INTO grupos (nombreGrupo, fotoGrupo_url, idCreador) VALUES (:nombre, :foto, :creador)";
    $stmt_group = $db->prepare($query_group);
    $stmt_group->bindParam(':nombre', $groupName);
    $stmt_group->bindParam(':foto', $imageUrl);
    $stmt_group->bindParam(':creador', $currentUserId, PDO::PARAM_INT);
    $stmt_group->execute();

    $idGrupo = $db->lastInsertId();

    // 2. Insertar al creador como miembro y administrador
    $query_creator_member = "INSERT INTO grupo_miembros (idGrupo, idUsuario, rol) VALUES (:idGrupo, :idUsuario, 'admin')";
    $stmt_creator = $db->prepare($query_creator_member);
    $stmt_creator->bindParam(':idGrupo', $idGrupo, PDO::PARAM_INT);
    $stmt_creator->bindParam(':idUsuario', $currentUserId, PDO::PARAM_INT);
    $stmt_creator->execute();

    // 3. Insertar a los demás miembros
    $query_member = "INSERT INTO grupo_miembros (idGrupo, idUsuario, rol) VALUES (:idGrupo, :idUsuario, 'miembro')";
    $stmt_member = $db->prepare($query_member);

    foreach ($members as $memberId) {
        $stmt_member->bindParam(':idGrupo', $idGrupo, PDO::PARAM_INT);
        $stmt_member->bindParam(':idUsuario', $memberId, PDO::PARAM_INT);
        $stmt_member->execute();
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => '¡Grupo creado exitosamente!',
        'group_id' => $idGrupo
    ]);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    // Para depuración: $e->getMessage()
    echo json_encode(['success' => false, 'message' => 'Error en el servidor al crear el grupo.']);
}
?>