<?php
  class Database {
    // Credenciales de la BD
    private $host = 'localhost';
    private $db_name = 'soccermix';
    private $username = 'root';
    private $password = '';
    private $conn;

    /**
     * Obtiene la conexión a la base de datos.
     * @return PDO Objeto de conexión PDO.
     * @throws PDOException si la conexión falla.
     */
    public function connect() {
      $this->conn = null;

      $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=utf8';

      try {
        $this->conn = new PDO($dsn, $this->username, $this->password);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
      } catch(PDOException $e) {
        // Relanzar la excepción para que sea manejada por el script que llama.
        throw new PDOException($e->getMessage(), (int)$e->getCode());
      }

      return $this->conn;
    }
  }
?>