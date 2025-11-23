CREATE DATABASE  IF NOT EXISTS `soccermix` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `soccermix`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: soccermix
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `amistades`
--

DROP TABLE IF EXISTS `amistades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amistades` (
  `idAmistad` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario1` int(11) NOT NULL,
  `idUsuario2` int(11) NOT NULL,
  `fecha_amistad` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idAmistad`),
  KEY `fk_usuario1_idx` (`idUsuario1`),
  KEY `fk_usuario2_idx` (`idUsuario2`),
  CONSTRAINT `fk_usuario1` FOREIGN KEY (`idUsuario1`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario2` FOREIGN KEY (`idUsuario2`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_configuracion`
--

DROP TABLE IF EXISTS `chat_configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_configuracion` (
  `idConfiguracion` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuarioA` int(11) NOT NULL,
  `idUsuarioB` int(11) NOT NULL,
  `cifradoActivo` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = No cifrado, 1 = Cifrado',
  PRIMARY KEY (`idConfiguracion`),
  UNIQUE KEY `relacion_unica` (`idUsuarioA`,`idUsuarioB`),
  KEY `fk_config_usuarioA_idx` (`idUsuarioA`),
  KEY `fk_config_usuarioB_idx` (`idUsuarioB`),
  CONSTRAINT `fk_config_usuarioA` FOREIGN KEY (`idUsuarioA`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_config_usuarioB` FOREIGN KEY (`idUsuarioB`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `copas_usuarios`
--

DROP TABLE IF EXISTS `copas_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `copas_usuarios` (
  `id_usuario` int(11) NOT NULL,
  `id_copa` varchar(50) NOT NULL,
  `fecha_adquisicion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`,`id_copa`),
  CONSTRAINT `fk_copa_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grupo_miembros`
--

DROP TABLE IF EXISTS `grupo_miembros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_miembros` (
  `idGrupo` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `rol` enum('admin','miembro') NOT NULL DEFAULT 'miembro',
  `fecha_union` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idGrupo`,`idUsuario`),
  KEY `fk_miembro_usuario_idx` (`idUsuario`),
  CONSTRAINT `fk_miembro_grupo` FOREIGN KEY (`idGrupo`) REFERENCES `grupos` (`idGrupo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_miembro_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `idGrupo` int(11) NOT NULL AUTO_INCREMENT,
  `nombreGrupo` varchar(100) NOT NULL,
  `fotoGrupo_url` varchar(255) DEFAULT NULL,
  `idCreador` int(11) NOT NULL,
  `fechaCreacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idGrupo`),
  KEY `fk_creador_grupo_idx` (`idCreador`),
  CONSTRAINT `fk_creador_grupo` FOREIGN KEY (`idCreador`) REFERENCES `usuarios` (`idUsuario`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `idMensaje` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuarioEmisor` int(11) NOT NULL,
  `idUsuarioReceptor` int(11) NOT NULL,
  `mensaje_texto` text DEFAULT NULL,
  `imagen1_url` varchar(255) DEFAULT NULL,
  `imagen2_url` varchar(255) DEFAULT NULL,
  `imagen3_url` varchar(255) DEFAULT NULL,
  `imagen4_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `es_cifrado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Flag para indicar si el mensaje está cifrado (1) o no (0)',
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idMensaje`),
  KEY `fk_emisor_idx` (`idUsuarioEmisor`),
  KEY `fk_receptor_idx` (`idUsuarioReceptor`),
  CONSTRAINT `fk_emisor` FOREIGN KEY (`idUsuarioEmisor`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_receptor` FOREIGN KEY (`idUsuarioReceptor`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_grupo`
--

DROP TABLE IF EXISTS `mensajes_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_grupo` (
  `idMensajeGrupo` int(11) NOT NULL AUTO_INCREMENT,
  `idGrupo` int(11) NOT NULL,
  `idUsuarioEmisor` int(11) NOT NULL,
  `mensaje_texto` text DEFAULT NULL,
  `imagen1_url` varchar(255) DEFAULT NULL,
  `imagen2_url` varchar(255) DEFAULT NULL,
  `imagen3_url` varchar(255) DEFAULT NULL,
  `imagen4_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idMensajeGrupo`),
  KEY `fk_msg_grupo_idx` (`idGrupo`),
  KEY `fk_msg_emisor_idx` (`idUsuarioEmisor`),
  CONSTRAINT `fk_msg_emisor` FOREIGN KEY (`idUsuarioEmisor`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_msg_grupo` FOREIGN KEY (`idGrupo`) REFERENCES `grupos` (`idGrupo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paises`
--

DROP TABLE IF EXISTS `paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `bandera_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `puntuaciones_usuarios`
--

DROP TABLE IF EXISTS `puntuaciones_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puntuaciones_usuarios` (
  `id_usuario` int(11) NOT NULL,
  `puntos` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `fk_puntuaciones_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rangos_usuarios`
--

DROP TABLE IF EXISTS `rangos_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rangos_usuarios` (
  `id_usuario` int(11) NOT NULL,
  `rango` varchar(20) NOT NULL DEFAULT 'plata',
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `fk_rango_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_amistad`
--

DROP TABLE IF EXISTS `solicitudes_amistad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_amistad` (
  `idSolicitud` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuarioSolicitante` int(11) NOT NULL,
  `idUsuarioReceptor` int(11) NOT NULL,
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idSolicitud`),
  UNIQUE KEY `solicitud_unica` (`idUsuarioSolicitante`,`idUsuarioReceptor`),
  KEY `fk_solicitante_idx` (`idUsuarioSolicitante`),
  KEY `fk_receptor_idx` (`idUsuarioReceptor`),
  CONSTRAINT `fk_receptor_solicitud` FOREIGN KEY (`idUsuarioReceptor`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_solicitante` FOREIGN KEY (`idUsuarioSolicitante`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tareas_grupales`
--

DROP TABLE IF EXISTS `tareas_grupales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas_grupales` (
  `idTarea` int(11) NOT NULL AUTO_INCREMENT,
  `nombreTarea` varchar(100) NOT NULL,
  `idGrupo` int(11) NOT NULL,
  `tipoActividad` enum('msg','media','vote') NOT NULL COMMENT 'msg: Enviar 5 mensajes, media: Enviar foto/video, vote: Votar por equipo',
  `idCreador` int(11) NOT NULL,
  `fechaCreacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','completada') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`idTarea`),
  KEY `fk_tarea_grupo_idx` (`idGrupo`),
  KEY `fk_tarea_creador_idx` (`idCreador`),
  CONSTRAINT `fk_tarea_creador` FOREIGN KEY (`idCreador`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tarea_grupo` FOREIGN KEY (`idGrupo`) REFERENCES `grupos` (`idGrupo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tareas_progreso_usuarios`
--

DROP TABLE IF EXISTS `tareas_progreso_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas_progreso_usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `idTarea` int(11) NOT NULL,
  `progreso` int(11) NOT NULL DEFAULT 0,
  `estado` enum('pendiente','completada') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_tarea_unique` (`idUsuario`,`idTarea`),
  KEY `fk_progreso_usuario_idx` (`idUsuario`),
  KEY `fk_progreso_tarea_idx` (`idTarea`),
  CONSTRAINT `fk_progreso_tarea` FOREIGN KEY (`idTarea`) REFERENCES `tareas_grupales` (`idTarea`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_progreso_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `torneos_simulados`
--

DROP TABLE IF EXISTS `torneos_simulados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneos_simulados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipo_a_id` int(11) NOT NULL,
  `equipo_b_id` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `countdown_start_time` timestamp NULL DEFAULT NULL,
  `puntos_premio` int(11) NOT NULL DEFAULT 0,
  `fecha_finalizacion` timestamp NULL DEFAULT NULL,
  `equipo_ganador_id` int(11) DEFAULT NULL,
  `goles_a` int(11) DEFAULT NULL,
  `goles_b` int(11) DEFAULT NULL,
  `estado` enum('activo','finalizado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `equipo_a_id` (`equipo_a_id`),
  KEY `equipo_b_id` (`equipo_b_id`),
  KEY `equipo_ganador_id` (`equipo_ganador_id`),
  CONSTRAINT `torneos_simulados_ibfk_1` FOREIGN KEY (`equipo_a_id`) REFERENCES `paises` (`id`),
  CONSTRAINT `torneos_simulados_ibfk_2` FOREIGN KEY (`equipo_b_id`) REFERENCES `paises` (`id`),
  CONSTRAINT `torneos_simulados_ibfk_3` FOREIGN KEY (`equipo_ganador_id`) REFERENCES `paises` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `nomCompleto` varchar(150) NOT NULL,
  `nomUsuario` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `pass` char(64) NOT NULL,
  `Fecha de nacimiento` date NOT NULL,
  `fotoPerfil` varchar(255) DEFAULT NULL COMMENT 'Ruta al archivo de la imagen de perfil del usuario',
  `biografia` text DEFAULT NULL COMMENT 'Biografía o descripción del usuario',
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `nomUsuario_UNIQUE` (`nomUsuario`),
  UNIQUE KEY `Email_UNIQUE` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `votos_usuarios_torneo`
--

DROP TABLE IF EXISTS `votos_usuarios_torneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votos_usuarios_torneo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_torneo` int(11) NOT NULL,
  `id_equipo_votado` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_usuario` (`id_usuario`,`id_torneo`),
  KEY `id_torneo` (`id_torneo`),
  KEY `id_equipo_votado` (`id_equipo_votado`),
  CONSTRAINT `votos_usuarios_torneo_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `votos_usuarios_torneo_ibfk_2` FOREIGN KEY (`id_torneo`) REFERENCES `torneos_simulados` (`id`),
  CONSTRAINT `votos_usuarios_torneo_ibfk_3` FOREIGN KEY (`id_equipo_votado`) REFERENCES `paises` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'soccermix'
--

--
-- Dumping routines for database 'soccermix'
--
/*!50003 DROP PROCEDURE IF EXISTS `actualizar_rango_usuario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_rango_usuario`(IN `p_id_usuario` INT)
BEGIN
    DECLARE puntos_actuales INT;
    DECLARE nuevo_rango VARCHAR(20);

    -- Obtener los puntos actuales del usuario
    SELECT puntos INTO puntos_actuales FROM puntuaciones_usuarios WHERE id_usuario = p_id_usuario;

    -- Determinar el nuevo rango basado en los puntos
    IF puntos_actuales >= 0 AND puntos_actuales <= 100 THEN
        SET nuevo_rango = 'plata';
    ELSEIF puntos_actuales > 100 AND puntos_actuales <= 300 THEN
        SET nuevo_rango = 'oro';
    ELSEIF puntos_actuales > 300 AND puntos_actuales <= 700 THEN
        SET nuevo_rango = 'rubi';
    ELSEIF puntos_actuales > 700 THEN
        SET nuevo_rango = 'diamante';
    ELSE
        SET nuevo_rango = 'plata'; -- Por defecto si los puntos son negativos
    END IF;

    -- Insertar o actualizar el rango del usuario
    INSERT INTO rangos_usuarios (id_usuario, rango)
    VALUES (p_id_usuario, nuevo_rango)
    ON DUPLICATE KEY UPDATE rango = nuevo_rango;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_actualizar_progreso_tarea` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_progreso_tarea`(
    IN p_idUsuario INT,
    IN p_tipoActividad VARCHAR(10),
    IN p_idGrupo INT
)
BEGIN
    DECLARE v_idTarea INT;
    DECLARE v_limite_tarea INT;
    DECLARE v_progreso_actual INT;
    DECLARE v_estado_actual VARCHAR(10);

    -- Límites para cada tipo de tarea
    CASE p_tipoActividad
        WHEN 'msg' THEN SET v_limite_tarea = 5;
        WHEN 'media' THEN SET v_limite_tarea = 1;
        WHEN 'vote' THEN SET v_limite_tarea = 1;
        ELSE SET v_limite_tarea = 0;
    END CASE;

    -- 1. Encontrar la tarea relevante para el usuario y el grupo/actividad
    -- Se une con grupo_miembros para asegurar que el usuario pertenece al grupo de la tarea
    SELECT tg.idTarea INTO v_idTarea
    FROM tareas_grupales tg
    JOIN grupo_miembros gm ON tg.idGrupo = gm.idGrupo
    WHERE 
        tg.tipoActividad = p_tipoActividad 
        AND gm.idUsuario = p_idUsuario
        AND (p_idGrupo IS NULL OR tg.idGrupo = p_idGrupo)
    ORDER BY tg.fechaCreacion DESC
    LIMIT 1;

    -- Si se encontró una tarea, proceder
    IF v_idTarea IS NOT NULL THEN
        -- 2. Insertar o actualizar el progreso del usuario
        INSERT INTO tareas_progreso_usuarios (idUsuario, idTarea, progreso, estado)
        VALUES (p_idUsuario, v_idTarea, 1, 'pendiente')
        ON DUPLICATE KEY UPDATE progreso = IF(estado = 'pendiente', progreso + 1, progreso);

        -- 3. Verificar si la tarea se completó y dar puntos
        SELECT progreso, estado INTO v_progreso_actual, v_estado_actual
        FROM tareas_progreso_usuarios
        WHERE idUsuario = p_idUsuario AND idTarea = v_idTarea;

        IF v_progreso_actual >= v_limite_tarea AND v_estado_actual = 'pendiente' THEN
            -- Marcar como completada
            UPDATE tareas_progreso_usuarios SET estado = 'completada'
            WHERE idUsuario = p_idUsuario AND idTarea = v_idTarea;

            -- Otorgar puntos
            INSERT INTO puntuaciones_usuarios (id_usuario, puntos)
            VALUES (p_idUsuario, 5)
            ON DUPLICATE KEY UPDATE puntos = puntos + 5;
        END IF;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_crear_tarea` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_tarea`(
    IN p_nombreTarea VARCHAR(100),
    IN p_idGrupo INT,
    IN p_tipoActividad ENUM('msg','media','vote'),
    IN p_idCreador INT
)
BEGIN
    DECLARE v_rol VARCHAR(10);

    -- Validar que el usuario es admin del grupo
    SELECT rol INTO v_rol FROM grupo_miembros
    WHERE idGrupo = p_idGrupo AND idUsuario = p_idCreador;

    IF v_rol = 'admin' THEN
        -- Insertar la nueva tarea
        INSERT INTO tareas_grupales (nombreTarea, idGrupo, tipoActividad, idCreador)
        VALUES (p_nombreTarea, p_idGrupo, p_tipoActividad, p_idCreador);
    ELSE
        -- Lanzar un error personalizado si no es admin
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No tienes permisos para crear tareas en este grupo.';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_finalizar_torneo_asignar_puntos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_finalizar_torneo_asignar_puntos`(
    IN `p_id_usuario` INT,
    IN `p_puntos` INT
)
BEGIN
    INSERT INTO puntuaciones_usuarios (id_usuario, puntos) 
    VALUES (p_id_usuario, p_puntos) 
    ON DUPLICATE KEY UPDATE puntos = puntos + p_puntos;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_finalizar_torneo_get_datos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_finalizar_torneo_get_datos`(
    IN `p_id_torneo` INT
)
BEGIN
    SELECT equipo_a_id, equipo_b_id, puntos_premio 
    FROM torneos_simulados 
    WHERE id = p_id_torneo 
      AND estado = 'activo' 
      AND countdown_start_time IS NOT NULL 
      AND NOW() >= DATE_ADD(countdown_start_time, INTERVAL 20 SECOND)
    LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_finalizar_torneo_get_ganadores` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_finalizar_torneo_get_ganadores`(
    IN `p_id_torneo` INT,
    IN `p_ganador_id` INT
)
BEGIN
    SELECT id_usuario 
    FROM votos_usuarios_torneo 
    WHERE id_torneo = p_id_torneo 
      AND id_equipo_votado = p_ganador_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_finalizar_torneo_update` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_finalizar_torneo_update`(
    IN `p_id_torneo` INT,
    IN `p_ganador_id` INT,
    IN `p_goles_a` INT,
    IN `p_goles_b` INT
)
BEGIN
    UPDATE torneos_simulados 
    SET 
        equipo_ganador_id = p_ganador_id, 
        goles_a = p_goles_a, 
        goles_b = p_goles_b, 
        estado = 'finalizado', 
        fecha_finalizacion = NOW() 
    WHERE id = p_id_torneo;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_admin_groups` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_admin_groups`(IN p_idUsuario INT)
BEGIN
    SELECT g.idGrupo, g.nombreGrupo
    FROM grupos g
    JOIN grupo_miembros gm ON g.idGrupo = gm.idGrupo
    WHERE gm.idUsuario = p_idUsuario AND gm.rol = 'admin'
    ORDER BY g.nombreGrupo ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_friends` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_friends`(IN `p_currentUserId` INT)
BEGIN
    -- Esta consulta une las tablas para encontrar a los amigos del usuario actual,
    -- y ahora también obtiene su rango, asignando 'plata' por defecto si no existe.
    SELECT 
        u.idUsuario, 
        u.nomUsuario, 
        u.fotoPerfil,
        COALESCE(r.rango, 'plata') AS rango
    FROM 
        usuarios u
    JOIN 
        amistades a ON (u.idUsuario = a.idUsuario1 AND a.idUsuario2 = p_currentUserId)
                    OR (u.idUsuario = a.idUsuario2 AND a.idUsuario1 = p_currentUserId)
    LEFT JOIN 
        rangos_usuarios r ON u.idUsuario = r.id_usuario
    WHERE
        u.idUsuario != p_currentUserId -- Asegurarse de no incluir al propio usuario
    ORDER BY 
        u.nomUsuario ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_non_friends` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_non_friends`(IN `p_currentUserId` INT)
BEGIN
    -- Este procedimiento obtiene una lista de usuarios que no son amigos del usuario actual
    -- y con los que no tiene una solicitud de amistad pendiente (ni enviada ni recibida).

    SELECT
        u.idUsuario,
        u.nomUsuario,
        u.fotoPerfil,
        -- Subconsulta para verificar si el usuario actual ya ha enviado una solicitud a este usuario.
        -- Devuelve 1 (true) si existe, 0 (false) si no.
        EXISTS (
            SELECT 1
            FROM solicitudes_amistad sa_sent
            WHERE sa_sent.idUsuarioSolicitante = p_currentUserId AND sa_sent.idUsuarioReceptor = u.idUsuario
        ) AS solicitud_pendiente
    FROM
        usuarios u
    WHERE
        -- 1. Excluir al propio usuario de la lista.
        u.idUsuario != p_currentUserId
        
        -- 2. Excluir usuarios que ya son amigos.
        --    La amistad puede estar en cualquier dirección (idUsuario1 -> idUsuario2 o viceversa).
        AND NOT EXISTS (
            SELECT 1
            FROM amistades a
            WHERE (a.idUsuario1 = p_currentUserId AND a.idUsuario2 = u.idUsuario)
               OR (a.idUsuario1 = u.idUsuario AND a.idUsuario2 = p_currentUserId)
        )
        
        -- 3. Excluir usuarios que ya han enviado una solicitud de amistad al usuario actual.
        AND NOT EXISTS (
            SELECT 1
            FROM solicitudes_amistad sa_received
            WHERE sa_received.idUsuarioSolicitante = u.idUsuario AND sa_received.idUsuarioReceptor = p_currentUserId
        )
    ORDER BY
        u.nomUsuario ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_profile_data` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_profile_data`(IN `p_idUsuario` INT)
BEGIN
    -- Este procedimiento obtiene la información del perfil y ahora también
    -- una lista de las copas que el usuario ha ganado.
    SELECT 
        u.idUsuario,
        u.nomUsuario,
        u.nomCompleto,
        u.Email,
        u.fotoPerfil,
        u.biografia,
        (SELECT GROUP_CONCAT(c.id_copa) FROM copas_usuarios c WHERE c.id_usuario = u.idUsuario) AS copas
    FROM 
        usuarios u
    WHERE 
        u.idUsuario = p_idUsuario;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_tareas_usuario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_tareas_usuario`(IN p_idUsuario INT)
BEGIN
    SELECT 
        g.idGrupo, g.nombreGrupo,
        tg.idTarea, tg.nombreTarea, tg.tipoActividad,
        COALESCE(tpu.progreso, 0) as progreso,
        COALESCE(tpu.estado, 'pendiente') as estado
    FROM tareas_grupales tg
    JOIN grupos g ON tg.idGrupo = g.idGrupo
    JOIN grupo_miembros gm ON g.idGrupo = gm.idGrupo
    LEFT JOIN tareas_progreso_usuarios tpu ON tg.idTarea = tpu.idTarea AND tpu.idUsuario = p_idUsuario
    WHERE gm.idUsuario = p_idUsuario
    ORDER BY g.nombreGrupo, tg.fechaCreacion DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_user_level` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_level`(IN `p_id_usuario` INT)
BEGIN
    -- Primero, nos aseguramos de que el rango del usuario esté actualizado
    -- llamando al procedimiento que ya teníamos.
    CALL actualizar_rango_usuario(p_id_usuario);

    -- Luego, seleccionamos los datos actualizados del usuario.
    -- Esta es la misma consulta que tenías en el PHP.
    SELECT
        COALESCE(p.puntos, 0) AS puntos,
        COALESCE(r.rango, 'plata') AS rango
    FROM usuarios u
    LEFT JOIN puntuaciones_usuarios p ON u.idUsuario = p.id_usuario
    LEFT JOIN rangos_usuarios r ON u.idUsuario = r.id_usuario
    WHERE u.idUsuario = p_id_usuario;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_send_group_message` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_send_group_message`(
    IN p_idGrupo INT,
    IN p_idUsuarioEmisor INT,
    IN p_mensaje_texto TEXT,
    IN p_imagen1_url VARCHAR(255),
    IN p_imagen2_url VARCHAR(255),
    IN p_imagen3_url VARCHAR(255),
    IN p_imagen4_url VARCHAR(255),
    IN p_video_url VARCHAR(255)
)
BEGIN
    DECLARE is_member INT DEFAULT 0;
    DECLARE new_message_id INT;

    -- 1. Verificar si el usuario es miembro del grupo
    SELECT COUNT(*) INTO is_member
    FROM grupo_miembros
    WHERE idGrupo = p_idGrupo AND idUsuario = p_idUsuarioEmisor;

    -- Si no es miembro, se lanza un error que PHP puede capturar
    IF is_member = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No perteneces a este grupo.';
    ELSE
        -- 2. Insertar el mensaje
        INSERT INTO mensajes_grupo (
            idGrupo, 
            idUsuarioEmisor, 
            mensaje_texto, 
            imagen1_url, 
            imagen2_url, 
            imagen3_url, 
            imagen4_url, 
            video_url
        ) VALUES (
            p_idGrupo, 
            p_idUsuarioEmisor, 
            p_mensaje_texto, 
            p_imagen1_url, 
            p_imagen2_url, 
            p_imagen3_url, 
            p_imagen4_url, 
            p_video_url
        );

        SET new_message_id = LAST_INSERT_ID();

        -- 3. Devolver el mensaje recién insertado para enviarlo al cliente
        SELECT 
            mg.*, 
            u.nomUsuario AS nombreEmisor
        FROM mensajes_grupo mg
        JOIN usuarios u ON mg.idUsuarioEmisor = u.idUsuario
        WHERE mg.idMensajeGrupo = new_message_id;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_profile` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_profile`(
    IN p_idUsuario INT,
    IN p_nomUsuario VARCHAR(50),
    IN p_nomCompleto VARCHAR(150),
    IN p_biografia TEXT,
    IN p_fotoPerfil VARCHAR(255)
)
BEGIN
    -- Comprueba si el nuevo nombre de usuario ya está en uso por otro usuario
    IF (SELECT COUNT(*) FROM usuarios WHERE nomUsuario = p_nomUsuario AND idUsuario != p_idUsuario) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El nombre de usuario ya está en uso.';
    ELSE
        UPDATE usuarios
        SET 
            nomUsuario = p_nomUsuario,
            nomCompleto = p_nomCompleto,
            biografia = p_biografia,
            -- Solo actualiza la foto de perfil si se proporciona una nueva
            fotoPerfil = IF(p_fotoPerfil IS NOT NULL AND p_fotoPerfil != '', p_fotoPerfil, fotoPerfil)
        WHERE idUsuario = p_idUsuario;
        
        -- Actualiza la variable de sesión si el nombre de usuario cambió
        IF (SELECT nomUsuario FROM usuarios WHERE idUsuario = p_idUsuario) = p_nomUsuario THEN
            -- Esta parte es conceptual, la actualización real de la sesión se hace en PHP
            SELECT 1;
        END IF;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-22 19:06:04
