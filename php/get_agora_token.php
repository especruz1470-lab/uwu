<?php
/**
 * Este script genera un token de Agora para un canal específico.
 */

session_start();

use Agora\RtcTokenBuilder2;
require_once 'RtcTokenBuilder2.php';
    
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No hay una sesión activa.']);
    exit();
}

if (!isset($_GET['channelName'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta el nombre del canal.']);
    exit();
}

// --- TUS CREDENCIALES DE AGORA ---
// Asegúrate de que estas credenciales sean EXACTAMENTE las mismas que en test_token.php
$appID = "e2bc3a41fddb43a69ccaa23cc00b8962";
$appCertificate = "daa1d0d306794742aacf72d1f364683d";
// ------------------------------------

$channelName = $_GET['channelName'];
// Usamos el ID de usuario de la sesión como UID en Agora. Debe ser un número.
$uid = (int)($_SESSION['user_id'] ?? 0); // Usamos el operador '??' para evitar un "Notice" si no existe.

// --- VALIDACIÓN ADICIONAL ---
// El UID en Agora no puede ser 0. Si es 0, significa que la sesión no se cargó correctamente.
if ($uid === 0) {
    http_response_code(403); // Prohibido
    echo json_encode(['success' => false, 'message' => 'El ID de usuario no es válido (es 0). La sesión podría no estar activa.']);
    exit();
}
$role = RtcTokenBuilder2::ROLE_PUBLISHER;
$expireTimeInSeconds = 3600; // El token será válido por 1 hora
$privilegeExpireTime = $expireTimeInSeconds; // El privilegio dura lo mismo que el token

try {
    // Usamos la nueva librería RtcTokenBuilder2
    $token = RtcTokenBuilder2::buildTokenWithUid(
        $appID,
        $appCertificate,
        $channelName,
        $uid,
        $role,
        $expireTimeInSeconds, // token expire
        $privilegeExpireTime  // privilege expire
    );

    echo json_encode([
        'success' => true,
        'token' => $token,
        'appId' => $appID,
        'uid' => $uid
    ]);
} catch (\Exception $e) { // Capturamos \Exception para ser más genéricos
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al generar el token de Agora.',
        'error' => $e->getMessage()
    ]);
}
?>