/**
 * encryption.js
 * Gestiona el cifrado y descifrado de mensajes de texto utilizando la Web Crypto API.
 */

const ENCRYPTION_ENABLED = true; // Interruptor global para la funcionalidad

/**
 * Deriva una clave secreta compartida para dos usuarios a partir de sus IDs.
 * En una aplicación real, esto se reemplazaría con un protocolo de intercambio de claves como Diffie-Hellman.
 * @param {string} userId1 - ID del primer usuario.
 * @param {string} userId2 - ID del segundo usuario.
 * @returns {Promise<CryptoKey>} La clave de cifrado AES-GCM.
 */
async function getSharedSecretKey(userId1, userId2) {
  if (!ENCRYPTION_ENABLED) return null;

  // Ordenar IDs para que la clave sea la misma sin importar quién la genere
  const sortedIds = [userId1, userId2].sort();
  const keyMaterialString = `soccermix-secret-${sortedIds[0]}-${sortedIds[1]}`;

  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.digest(
    'SHA-256',
    encoder.encode(keyMaterialString)
  );

  return window.crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM' },
    false, // no exportable
    ['encrypt', 'decrypt']
  );
}

/**
 * Cifra un mensaje de texto.
 * @param {CryptoKey} key - La clave de cifrado.
 * @param {string} plaintext - El mensaje de texto a cifrar.
 * @returns {Promise<string>} El texto cifrado en formato Base64, con el IV prefijado.
 */
async function encryptMessage(key, plaintext) {
  if (!ENCRYPTION_ENABLED || !key) return plaintext;

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // El IV debe ser único para cada cifrado con la misma clave. 12 bytes es lo recomendado para AES-GCM.
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );

  // Prefijar el IV al ciphertext para que el receptor pueda usarlo para descifrar.
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);

  // Convertir a Base64 para un transporte seguro como texto.
  return btoa(String.fromCharCode.apply(null, combined));
}

/**
 * Descifra un mensaje de texto.
 * @param {CryptoKey} key - La clave de cifrado.
 * @param {string} encryptedBase64 - El texto cifrado en Base64 (con el IV prefijado).
 * @returns {Promise<string>} El mensaje de texto original.
 */
async function decryptMessage(key, encryptedBase64) {
  if (!ENCRYPTION_ENABLED || !key) return encryptedBase64;

  try {
    const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
    
    // Extraer el IV (los primeros 12 bytes)
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error("Error al descifrar:", error);
    return "🔒 (Error al descifrar el mensaje)";
  }
}