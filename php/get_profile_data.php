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
// Si se proporciona un user_id en la URL, se usa. Si no, se usa el del usuario logueado.
if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
    $profileUserId = filter_var($_GET['user_id'], FILTER_SANITIZE_NUMBER_INT);
} else {
    $profileUserId = $currentUserId;
}

try {
    $database = new Database();
    $db = $database->connect();

    // Llamada al procedimiento almacenado para obtener los detalles del perfil
    $query = "CALL sp_get_profile_data(:profileUserId)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':profileUserId', $profileUserId, PDO::PARAM_INT);
    $stmt->execute();

    $profileData = $stmt->fetch(PDO::FETCH_ASSOC);

    // Cierra el cursor para permitir la ejecución de la siguiente consulta.
    $stmt->closeCursor();

    if ($profileData) {
        // Si hay una foto de perfil, ajustamos la ruta para que sea accesible desde el directorio /html
        if (!empty($profileData['fotoPerfil'])) {
            // Asegurarse de no añadir '../' si ya está presente
            if (strpos($profileData['fotoPerfil'], '../') !== 0) {
                $profileData['fotoPerfil'] = '../' . $profileData['fotoPerfil'];
            }
        }

        // Llamar al SP para obtener el rango y los puntos actualizados
        $stmt_level = $db->prepare("CALL sp_get_user_level(:userId)");
        $stmt_level->bindParam(':userId', $profileUserId, PDO::PARAM_INT);
        $stmt_level->execute();
        $levelData = $stmt_level->fetch(PDO::FETCH_ASSOC);

        // Añadimos un campo para saber si es el perfil propio
        // Y valores por defecto para los campos que ya no están en la tabla
        $profileData['nivel'] = $levelData ? $levelData['rango'] : 'plata';
        $profileData['puntos'] = $levelData ? (int)$levelData['puntos'] : 0;
        // Convertir la cadena de copas en un array. Si es null, se convierte en un array vacío.
        $profileData['copas'] = $profileData['copas'] ? explode(',', $profileData['copas']) : [];
        $profileData['isOwnProfile'] = ($profileUserId == $currentUserId);
        echo json_encode(['success' => true, 'profile' => $profileData]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Perfil no encontrado.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>