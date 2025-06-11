-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : Marine:3306
-- Généré le : mar. 10 juin 2025 à 13:50
-- Version du serveur : 9.2.0
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `Marine`
--

-- --------------------------------------------------------

--
-- Structure de la table `AccesRapport`
--

CREATE TABLE `AccesRapport` (
  `id_acces` int NOT NULL,
  `id_rapport` int NOT NULL,
  `id_operateur` int NOT NULL,
  `peut_modifier` tinyint(1) NOT NULL DEFAULT '0',
  `date_attribution` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `AccesRapport`
--

INSERT INTO `AccesRapport` (`id_acces`, `id_rapport`, `id_operateur`, `peut_modifier`, `date_attribution`) VALUES
(23, 35, 1, 1, '2025-05-14 08:56:52'),
(24, 36, 1, 1, '2025-05-14 11:39:01'),
(25, 37, 1, 1, '2025-05-14 11:41:12'),
(26, 39, 1, 1, '2025-05-15 07:13:01'),
(27, 43, 1, 1, '2025-05-15 08:18:33'),
(28, 45, 1, 1, '2025-05-15 08:24:54'),
(29, 46, 1, 1, '2025-05-15 08:29:14'),
(31, 46, 5, 1, '2025-05-16 12:10:25'),
(32, 43, 3, 1, '2025-05-20 08:00:38'),
(33, 47, 1, 1, '2025-05-20 08:20:14'),
(34, 47, 3, 1, '2025-05-28 07:38:49'),
(35, 49, 1, 1, '2025-06-04 12:01:11'),
(36, 51, 1, 1, '2025-06-05 12:21:18'),
(37, 52, 1, 1, '2025-06-06 07:40:15'),
(38, 52, 2, 1, '2025-06-06 11:46:34'),
(39, 52, 5, 1, '2025-06-06 12:14:44'),
(40, 52, 3, 1, '2025-06-06 12:19:12'),
(41, 53, 3, 1, '2025-06-10 11:45:26'),
(42, 54, 1, 1, '2025-06-10 12:37:06'),
(43, 55, 3, 1, '2025-06-10 12:43:29'),
(44, 56, 1, 1, '2025-06-10 12:46:03');

-- --------------------------------------------------------

--
-- Structure de la table `Alerte`
--

CREATE TABLE `Alerte` (
  `id_alerte` int NOT NULL,
  `id_rapport` int NOT NULL,
  `cedre` tinyint(1) NOT NULL DEFAULT '0',
  `cross_contact` tinyint(1) NOT NULL DEFAULT '0',
  `smp` tinyint(1) NOT NULL DEFAULT '0',
  `bsaa` tinyint(1) NOT NULL DEFAULT '0',
  `delai_appareillage_bsaa` varchar(100) DEFAULT NULL,
  `polrep` tinyint(1) NOT NULL DEFAULT '0',
  `message_polrep` text,
  `photo` tinyint(1) NOT NULL DEFAULT '0',
  `derive_mothym` tinyint(1) NOT NULL DEFAULT '0',
  `pne` tinyint(1) NOT NULL DEFAULT '0',
  `sensible_proximite` tinyint(1) DEFAULT NULL,
  `moyen_proximite` text,
  `moyen_depeche` text,
  `moyen_marine_etat` text,
  `risque_court_terme` text,
  `risque_moyen_long_terme` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Alerte`
--

INSERT INTO `Alerte` (`id_alerte`, `id_rapport`, `cedre`, `cross_contact`, `smp`, `bsaa`, `delai_appareillage_bsaa`, `polrep`, `message_polrep`, `photo`, `derive_mothym`, `pne`, `sensible_proximite`, `moyen_proximite`, `moyen_depeche`, `moyen_marine_etat`, `risque_court_terme`, `risque_moyen_long_terme`) VALUES
(22, 35, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 36, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 37, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 39, 1, 1, 1, 1, '2025-05-15 09:13:00.000', 1, NULL, 1, 1, 1, 1, 'Total ', 'Total ', 'Total ', 'Total ', 'Total '),
(26, 43, 0, 0, 0, 0, NULL, 0, '1', 0, 0, 0, 0, 'cible', 'cible', 'cible', 'cible', 'cible'),
(27, 45, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(28, 46, 0, 0, 1, 0, NULL, 0, NULL, 0, 0, 0, 1, 'NordSecteur ', 'NordSecteur ', 'NordSecteur ', 'NordSecteur ', 'NordSecteur '),
(29, 47, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(30, 49, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(31, 51, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(32, 52, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(33, 53, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(34, 54, 1, 1, 1, 1, '2025-06-06 17:36:00.000', 0, '1', 1, 1, 0, 1, '11', '11', '11', '11', '11'),
(35, 55, 1, 1, 1, 1, '2025-06-07T17:43', 0, '1', 1, 1, 1, 1, 'Re', 'Re', 'Re', 'Re', 'Re'),
(36, 56, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 1, 0, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `Cible`
--

CREATE TABLE `Cible` (
  `id_cible` int NOT NULL,
  `id_rapport` int NOT NULL,
  `nom` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `pavillon` varchar(100) DEFAULT NULL,
  `immatriculation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TypeProduit` varchar(100) DEFAULT NULL,
  `QuantiteProduit` varchar(10000) DEFAULT NULL,
  `id_type_cible` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Cible`
--

INSERT INTO `Cible` (`id_cible`, `id_rapport`, `nom`, `pavillon`, `immatriculation`, `TypeProduit`, `QuantiteProduit`, `id_type_cible`) VALUES
(27, 35, '10LMza', '10LMza', '10LMza', '10LMza', '110T', 1),
(28, 36, 'TestMaree', 'TestMaree', 'TestMaree', 'TestMaree', '100', 1),
(29, 37, 'TestMaree2', 'TestMaree2', 'TestMaree2', 'TestMaree2', 'TestMaree2', 1),
(31, 39, 'Total ', 'Total ', 'Total ', 'Total ', 'Total ', 1),
(32, 43, 'cible', 'cible', 'cible', 'cible', 'cible', NULL),
(33, 45, 'Type cible', NULL, NULL, NULL, NULL, NULL),
(34, 46, 'NordSecteur ', 'NordSecteur ', 'NordSecteur ', 'NordSecteur ', 'NordSecteur ', 2),
(35, 47, 'pOS', 'f', 'pOS', 'pOS', 'pOS', 3),
(36, 49, 'fdd', 'dfdf', 'dfdf', 'dfdf', 'dfdf', 5),
(37, 51, NULL, NULL, NULL, NULL, NULL, 7),
(38, 52, 'e', NULL, NULL, NULL, NULL, 8),
(39, 53, 'TestSup', 'TestSup', 'TestSup', 'TestSup', 'TestSup', 9),
(40, 54, '3', '4', '5', '6', '7', 10),
(41, 55, 'Re', 'Re', 'Re', 'Re', 'Re', 11),
(42, 56, 'Meteo', 'Meteo', 'Meteo', 'MeteoMeteo', 'Meteo', 12);

-- --------------------------------------------------------

--
-- Structure de la table `Commentaire`
--

CREATE TABLE `Commentaire` (
  `id_commentaire` int NOT NULL,
  `id_rapport` int NOT NULL,
  `id_operateur` int NOT NULL,
  `contenu` text NOT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Historique`
--

CREATE TABLE `Historique` (
  `id_historique` int NOT NULL,
  `id_rapport` int NOT NULL,
  `id_operateur` int NOT NULL,
  `type_action` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `detail_action` text,
  `date_action` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Historique`
--

INSERT INTO `Historique` (`id_historique`, `id_rapport`, `id_operateur`, `type_action`, `detail_action`, `date_action`) VALUES
(26, 46, 1, 'zz', 'zz', '2025-05-15 13:09:33'),
(27, 46, 1, 'Modification Rapport', 'Champs modifiés :\n- titre : \"NordSecteur \" → \"NordSecteurT\"', '2025-05-15 15:38:30'),
(28, 46, 1, 'Modification Rapport', 'Aucune modification détectée', '2025-05-16 09:10:28'),
(29, 46, 1, 'Modification Rapport', 'Aucune modification détectée', '2025-05-16 09:28:29'),
(30, 46, 1, 'Modification Rapport', 'Aucune modification détectée', '2025-05-16 09:31:52'),
(31, 46, 1, 'Modification Rapport', 'Champs modifiés :\n- description_globale : \"NordSecteur \" → \"NordSecteur S\"', '2025-05-16 09:33:24'),
(32, 46, 1, 'Test Manuel', '[MANUEL] Bateau coule', '2025-05-16 10:01:22'),
(33, 46, 2, 'AJOUT_D_ACCES', NULL, '2025-05-16 14:10:23'),
(34, 46, 2, 'RETRAIT_D_ACCES', NULL, '2025-05-16 14:10:24'),
(35, 46, 5, 'AJOUT_D_ACCES', NULL, '2025-05-16 14:10:26'),
(36, 46, 1, 'Modification Rapport', 'Champs modifiés :\n- description_globale : \"NordSecteur S\" → \"NordSecteur S sb\"', '2025-05-19 14:44:21'),
(37, 46, 1, 'Modification Rapport', 'Champs modifiés :\n- description_globale : \"NordSecteur S sb\" → \"NordSecteur S sbf\"', '2025-05-19 14:51:59'),
(38, 46, 1, 'Modification Rapport', 'Aucune modification détectée', '2025-05-19 14:53:11'),
(39, 43, 3, 'AJOUT_D_ACCES', NULL, '2025-05-20 10:00:38'),
(40, 47, 3, 'AJOUT_D_ACCES', NULL, '2025-05-28 09:38:49'),
(41, 47, 1, 'Modification Rapport', 'Champs modifiés :\n- titre : \"pOS\" → \"Test\"', '2025-05-28 09:40:25'),
(42, 47, 1, 'Appel recu', 'On m\'a informé de ', '2025-05-28 09:40:46'),
(43, 51, 1, 'appel du Cross', 'Test', '2025-06-06 10:06:00'),
(44, 52, 2, 'AJOUT_D_ACCES', NULL, '2025-06-06 13:46:34'),
(45, 52, 5, 'AJOUT_D_ACCES', NULL, '2025-06-06 14:14:45'),
(46, 52, 3, 'AJOUT_D_ACCES', NULL, '2025-06-06 14:19:12'),
(47, 52, 1, 'Modification Rapport', 'Champs modifiés :\n- titre : \"test\" → \"testf\"', '2025-06-06 14:38:54'),
(48, 52, 3, 'Modification Rapport', 'Champs modifiés :\n- titre : \"testf\" → \"testfc\"', '2025-06-10 09:58:50');

-- --------------------------------------------------------

--
-- Structure de la table `Lieu`
--

CREATE TABLE `Lieu` (
  `id_lieu` int NOT NULL,
  `id_rapport` int NOT NULL,
  `details_lieu` text,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `id_zone` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Lieu`
--

INSERT INTO `Lieu` (`id_lieu`, `id_rapport`, `details_lieu`, `latitude`, `longitude`, `id_zone`) VALUES
(27, 35, '10LMza', 43.40887600, 4.96682100, 2),
(28, 36, 'TestMaree', 43.27852400, 5.07410400, 1),
(29, 37, 'TestMaree2', 43.41473400, 5.37221200, 1),
(31, 39, 'Total ', 43.39151400, 5.00113800, 2),
(32, 43, 'cible', 43.33080900, 5.29763900, 2),
(33, 45, NULL, NULL, NULL, 2),
(34, 46, 'NordSecteur ', 43.38253200, 4.99564800, 2),
(35, 47, 'pOS', 48.28931500, -5.22133000, 1),
(36, 49, NULL, 48.65772500, -4.67138600, 2),
(37, 51, NULL, NULL, NULL, 1),
(38, 52, NULL, NULL, NULL, 1),
(39, 53, 'TestSup', NULL, NULL, 2),
(40, 54, '8', 48.51791200, -4.81194900, 2),
(41, 55, 'Re', 48.51954900, -4.85041000, 2),
(42, 56, 'Meteo', 48.52700800, -4.79958700, 2);

-- --------------------------------------------------------

--
-- Structure de la table `Meteo`
--

CREATE TABLE `Meteo` (
  `id_meteo` int NOT NULL,
  `id_rapport` int NOT NULL,
  `direction_vent` varchar(50) DEFAULT NULL,
  `force_vent` varchar(50) DEFAULT NULL,
  `etat_mer` varchar(100) DEFAULT NULL,
  `nebulosite` varchar(100) DEFAULT NULL,
  `maree` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Meteo`
--

INSERT INTO `Meteo` (`id_meteo`, `id_rapport`, `direction_vent`, `force_vent`, `etat_mer`, `nebulosite`, `maree`) VALUES
(27, 35, 'NE', '5', '7', '1', NULL),
(28, 36, 'NE', '7', '7', '2', NULL),
(29, 37, 'NE', '4', '7', '1', 'basse'),
(31, 39, 'NE', '2', '6', '2', 'basse'),
(32, 43, 'NE', '3', '7', '2', 'basse'),
(33, 45, NULL, NULL, NULL, NULL, NULL),
(34, 46, 'NE', '7', '8', '4', 'basse'),
(35, 47, NULL, NULL, NULL, NULL, NULL),
(36, 49, NULL, NULL, NULL, NULL, NULL),
(37, 51, NULL, NULL, NULL, NULL, NULL),
(38, 52, 'E', '10', '3', '4', 'haute'),
(39, 53, NULL, NULL, NULL, NULL, NULL),
(40, 54, 'NE', '12', '8', '3', 'basse'),
(41, 55, 'E', '10', '2', NULL, 'basse'),
(42, 56, 'NE', '8', '1', '2', 'haute');

-- --------------------------------------------------------

--
-- Structure de la table `MotDePasse`
--

CREATE TABLE `MotDePasse` (
  `id_motdepasse` int NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `info` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `MotDePasse`
--

INSERT INTO `MotDePasse` (`id_motdepasse`, `mot_de_passe`, `date_creation`, `date_modification`, `info`) VALUES
(1, 'supersecure123', '2025-04-23 07:44:40', '2025-05-19 13:47:35', 'Opérateur'),
(2, 'test1234', '2025-05-19 13:47:55', '2025-05-19 13:47:55', 'Admin');

-- --------------------------------------------------------

--
-- Structure de la table `Operateur`
--

CREATE TABLE `Operateur` (
  `id_operateur` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `id_motdepasse` int DEFAULT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Operateur`
--

INSERT INTO `Operateur` (`id_operateur`, `nom`, `prenom`, `id_motdepasse`, `date_creation`) VALUES
(1, 'LE REST', 'Thibault', NULL, '2025-04-23 08:02:33'),
(2, 'TOUZARD', 'Youna', NULL, '2025-04-23 08:02:33'),
(3, 'MIGNOT', 'Morgane', NULL, '2025-04-23 08:02:33'),
(4, 'LESVEN', 'Bruno', NULL, '2025-04-23 08:02:33'),
(5, 'DEGRENNE', 'Jean-Sébastien', NULL, '2025-04-23 08:02:33'),
(6, 'PORCHE', 'François', NULL, '2025-04-23 08:02:33'),
(7, 'LE GAREC', 'Yann', NULL, '2025-04-23 08:02:33'),
(8, 'MAGUEUR', 'Gérald', NULL, '2025-04-23 08:02:33');

-- --------------------------------------------------------

--
-- Structure de la table `OrigineEvenement`
--

CREATE TABLE `OrigineEvenement` (
  `id_origine_evenement` int NOT NULL,
  `libelle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `OrigineEvenement`
--

INSERT INTO `OrigineEvenement` (`id_origine_evenement`, `libelle`) VALUES
(3, 'Avarie'),
(1, 'Collision'),
(2, 'Échouement');

-- --------------------------------------------------------

--
-- Structure de la table `Rapport`
--

CREATE TABLE `Rapport` (
  `id_rapport` int NOT NULL,
  `titre` varchar(200) NOT NULL,
  `date_evenement` datetime NOT NULL,
  `description_globale` text,
  `id_operateur` int NOT NULL,
  `id_type_evenement` int DEFAULT NULL,
  `id_sous_type_evenement` int DEFAULT NULL,
  `id_origine_evenement` int DEFAULT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archive` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Rapport`
--

INSERT INTO `Rapport` (`id_rapport`, `titre`, `date_evenement`, `description_globale`, `id_operateur`, `id_type_evenement`, `id_sous_type_evenement`, `id_origine_evenement`, `date_creation`, `date_modification`, `archive`) VALUES
(35, '10LMza', '2025-05-14 10:41:00', '10LMza', 1, 1, NULL, 3, '2025-05-14 08:56:52', '2025-05-14 08:56:52', 0),
(36, 'TestMaree', '2025-05-14 13:32:00', 'TestMaree', 1, 2, 6, 3, '2025-05-14 11:39:01', '2025-05-14 11:39:01', 0),
(37, 'TestMaree2', '2025-05-14 11:39:00', 'TestMaree2', 1, 2, 6, 3, '2025-05-14 11:41:12', '2025-05-14 11:41:12', 0),
(39, 'Total ', '2025-05-15 09:08:00', 'Total ', 1, 2, 6, 3, '2025-05-15 07:13:01', '2025-05-15 07:13:01', 0),
(43, 'cible', '2025-05-15 09:13:00', 'cible', 1, 2, 6, 3, '2025-05-15 08:18:33', '2025-05-15 08:18:33', 0),
(45, 'Type cible', '2025-05-15 08:18:00', 'Type cible', 1, 2, 6, NULL, '2025-05-15 08:24:54', '2025-05-15 08:24:54', 0),
(46, 'NordSecteurT', '2025-05-15 10:27:00', 'NordSecteur S sbf', 1, 2, 5, 3, '2025-05-15 08:29:14', '2025-05-19 12:53:11', 1),
(47, 'Test', '2025-05-20 12:19:00', 'pOS', 1, 4, NULL, 3, '2025-05-20 08:20:14', '2025-05-28 07:40:25', 0),
(49, 'Brest', '2025-06-04 16:00:00', 'dv', 1, 2, 6, 1, '2025-06-04 12:01:11', '2025-06-04 12:01:11', 0),
(51, 'f', '2025-06-05 16:18:00', 'f', 1, 2, NULL, NULL, '2025-06-05 12:21:18', '2025-06-05 12:21:18', 0),
(52, 'testfc', '2025-06-06 11:39:00', 'f', 1, 2, 5, 3, '2025-06-06 07:40:15', '2025-06-10 07:58:50', 0),
(53, 'TestSup', '2025-06-10 15:45:00', 'TestSup', 3, 2, 6, 3, '2025-06-10 11:45:26', '2025-06-10 11:45:26', 0),
(54, '1', '2025-06-10 16:36:00', '11', 1, 2, 6, 3, '2025-06-10 12:37:06', '2025-06-10 12:37:06', 0),
(55, 'Re', '2025-06-10 16:42:00', 'Re', 3, 2, 6, 3, '2025-06-10 12:43:29', '2025-06-10 12:43:29', 0),
(56, 'Meteo', '2025-06-10 16:45:00', 'Meteo', 1, 4, NULL, 3, '2025-06-10 12:46:03', '2025-06-10 12:46:03', 0);

-- --------------------------------------------------------

--
-- Structure de la table `Ressource`
--

CREATE TABLE `Ressource` (
  `id` int NOT NULL,
  `nom` varchar(255) NOT NULL,
  `chemin` varchar(512) NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Ressource`
--

INSERT INTO `Ressource` (`id`, `nom`, `chemin`, `type`) VALUES
(1, 'Numeros Importants', 'Numeros_Importants_Pollution_Marine.pdf', 'pdf'),
(2, 'Canutec Guide des mesures d\'urgence', '2024-guide-de-mesures-durgence.pdf', 'pdf');

-- --------------------------------------------------------

--
-- Structure de la table `Source`
--

CREATE TABLE `Source` (
  `id_source` int NOT NULL,
  `id_rapport` int NOT NULL,
  `type_document` varchar(50) NOT NULL,
  `nom_fichier` varchar(255) DEFAULT NULL,
  `lien` varchar(500) DEFAULT NULL,
  `description` text,
  `date_ajout` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_operateur` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `SousTypeEvenement`
--

CREATE TABLE `SousTypeEvenement` (
  `id_sous_type_evenement` int NOT NULL,
  `id_type_evenement` int NOT NULL,
  `libelle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `SousTypeEvenement`
--

INSERT INTO `SousTypeEvenement` (`id_sous_type_evenement`, `id_type_evenement`, `libelle`) VALUES
(3, 1, 'Autre'),
(2, 1, 'Chimique'),
(1, 1, 'Hydrocarbure'),
(6, 2, 'Avarie Propulsion'),
(5, 2, 'Feu'),
(4, 2, 'Voies d\'eau');

-- --------------------------------------------------------

--
-- Structure de la table `TypeCible`
--

CREATE TABLE `TypeCible` (
  `id_type_cible` int NOT NULL,
  `libelle` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `TypeCible`
--

INSERT INTO `TypeCible` (`id_type_cible`, `libelle`) VALUES
(1, 'Porte-conteneurs'),
(2, 'NordSecteur '),
(3, 'pOS'),
(5, 'Amoco'),
(7, 'f'),
(8, 'e'),
(9, 'TestSup'),
(10, '2'),
(11, 'Re'),
(12, 'Meteo');

-- --------------------------------------------------------

--
-- Structure de la table `TypeEvenement`
--

CREATE TABLE `TypeEvenement` (
  `id_type_evenement` int NOT NULL,
  `libelle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `TypeEvenement`
--

INSERT INTO `TypeEvenement` (`id_type_evenement`, `libelle`) VALUES
(2, 'ANED'),
(4, 'Autre'),
(1, 'Pollution'),
(3, 'SVH');

-- --------------------------------------------------------

--
-- Structure de la table `ZoneGeographique`
--

CREATE TABLE `ZoneGeographique` (
  `id_zone` int NOT NULL,
  `nom_zone` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ZoneGeographique`
--

INSERT INTO `ZoneGeographique` (`id_zone`, `nom_zone`) VALUES
(1, 'Manche'),
(2, 'Mer du Nord'),
(3, 'Atlantique'),
(4, 'Méditerranée'),
(5, 'Océan Indien'),
(6, 'Pacifique'),
(7, 'Mer Noire'),
(8, 'Mer Rouge');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `AccesRapport`
--
ALTER TABLE `AccesRapport`
  ADD PRIMARY KEY (`id_acces`),
  ADD UNIQUE KEY `id_rapport` (`id_rapport`,`id_operateur`),
  ADD KEY `id_operateur` (`id_operateur`);

--
-- Index pour la table `Alerte`
--
ALTER TABLE `Alerte`
  ADD PRIMARY KEY (`id_alerte`),
  ADD KEY `id_rapport` (`id_rapport`);

--
-- Index pour la table `Cible`
--
ALTER TABLE `Cible`
  ADD PRIMARY KEY (`id_cible`),
  ADD KEY `id_rapport` (`id_rapport`),
  ADD KEY `fk_type_cible` (`id_type_cible`);

--
-- Index pour la table `Commentaire`
--
ALTER TABLE `Commentaire`
  ADD PRIMARY KEY (`id_commentaire`),
  ADD KEY `id_rapport` (`id_rapport`),
  ADD KEY `id_operateur` (`id_operateur`);

--
-- Index pour la table `Historique`
--
ALTER TABLE `Historique`
  ADD PRIMARY KEY (`id_historique`),
  ADD KEY `id_rapport` (`id_rapport`),
  ADD KEY `id_operateur` (`id_operateur`);

--
-- Index pour la table `Lieu`
--
ALTER TABLE `Lieu`
  ADD PRIMARY KEY (`id_lieu`),
  ADD KEY `id_rapport` (`id_rapport`),
  ADD KEY `fk_zone` (`id_zone`);

--
-- Index pour la table `Meteo`
--
ALTER TABLE `Meteo`
  ADD PRIMARY KEY (`id_meteo`),
  ADD KEY `id_rapport` (`id_rapport`);

--
-- Index pour la table `MotDePasse`
--
ALTER TABLE `MotDePasse`
  ADD PRIMARY KEY (`id_motdepasse`);

--
-- Index pour la table `Operateur`
--
ALTER TABLE `Operateur`
  ADD PRIMARY KEY (`id_operateur`),
  ADD KEY `id_motdepasse` (`id_motdepasse`);

--
-- Index pour la table `OrigineEvenement`
--
ALTER TABLE `OrigineEvenement`
  ADD PRIMARY KEY (`id_origine_evenement`),
  ADD UNIQUE KEY `libelle` (`libelle`);

--
-- Index pour la table `Rapport`
--
ALTER TABLE `Rapport`
  ADD PRIMARY KEY (`id_rapport`),
  ADD KEY `id_operateur` (`id_operateur`),
  ADD KEY `id_type_evenement` (`id_type_evenement`),
  ADD KEY `id_sous_type_evenement` (`id_sous_type_evenement`),
  ADD KEY `id_origine_evenement` (`id_origine_evenement`);

--
-- Index pour la table `Ressource`
--
ALTER TABLE `Ressource`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `Source`
--
ALTER TABLE `Source`
  ADD PRIMARY KEY (`id_source`),
  ADD KEY `id_rapport` (`id_rapport`),
  ADD KEY `id_operateur` (`id_operateur`);

--
-- Index pour la table `SousTypeEvenement`
--
ALTER TABLE `SousTypeEvenement`
  ADD PRIMARY KEY (`id_sous_type_evenement`),
  ADD UNIQUE KEY `id_type_evenement` (`id_type_evenement`,`libelle`);

--
-- Index pour la table `TypeCible`
--
ALTER TABLE `TypeCible`
  ADD PRIMARY KEY (`id_type_cible`);

--
-- Index pour la table `TypeEvenement`
--
ALTER TABLE `TypeEvenement`
  ADD PRIMARY KEY (`id_type_evenement`),
  ADD UNIQUE KEY `libelle` (`libelle`);

--
-- Index pour la table `ZoneGeographique`
--
ALTER TABLE `ZoneGeographique`
  ADD PRIMARY KEY (`id_zone`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `AccesRapport`
--
ALTER TABLE `AccesRapport`
  MODIFY `id_acces` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT pour la table `Alerte`
--
ALTER TABLE `Alerte`
  MODIFY `id_alerte` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT pour la table `Cible`
--
ALTER TABLE `Cible`
  MODIFY `id_cible` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `Commentaire`
--
ALTER TABLE `Commentaire`
  MODIFY `id_commentaire` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Historique`
--
ALTER TABLE `Historique`
  MODIFY `id_historique` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT pour la table `Lieu`
--
ALTER TABLE `Lieu`
  MODIFY `id_lieu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `Meteo`
--
ALTER TABLE `Meteo`
  MODIFY `id_meteo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `MotDePasse`
--
ALTER TABLE `MotDePasse`
  MODIFY `id_motdepasse` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `Operateur`
--
ALTER TABLE `Operateur`
  MODIFY `id_operateur` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `OrigineEvenement`
--
ALTER TABLE `OrigineEvenement`
  MODIFY `id_origine_evenement` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `Rapport`
--
ALTER TABLE `Rapport`
  MODIFY `id_rapport` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT pour la table `Ressource`
--
ALTER TABLE `Ressource`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `Source`
--
ALTER TABLE `Source`
  MODIFY `id_source` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `SousTypeEvenement`
--
ALTER TABLE `SousTypeEvenement`
  MODIFY `id_sous_type_evenement` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `TypeCible`
--
ALTER TABLE `TypeCible`
  MODIFY `id_type_cible` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `TypeEvenement`
--
ALTER TABLE `TypeEvenement`
  MODIFY `id_type_evenement` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `ZoneGeographique`
--
ALTER TABLE `ZoneGeographique`
  MODIFY `id_zone` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `AccesRapport`
--
ALTER TABLE `AccesRapport`
  ADD CONSTRAINT `AccesRapport_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE,
  ADD CONSTRAINT `AccesRapport_ibfk_2` FOREIGN KEY (`id_operateur`) REFERENCES `Operateur` (`id_operateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `Alerte`
--
ALTER TABLE `Alerte`
  ADD CONSTRAINT `Alerte_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE;

--
-- Contraintes pour la table `Cible`
--
ALTER TABLE `Cible`
  ADD CONSTRAINT `Cible_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_type_cible` FOREIGN KEY (`id_type_cible`) REFERENCES `TypeCible` (`id_type_cible`);

--
-- Contraintes pour la table `Commentaire`
--
ALTER TABLE `Commentaire`
  ADD CONSTRAINT `Commentaire_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE,
  ADD CONSTRAINT `Commentaire_ibfk_2` FOREIGN KEY (`id_operateur`) REFERENCES `Operateur` (`id_operateur`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `Historique`
--
ALTER TABLE `Historique`
  ADD CONSTRAINT `Historique_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE,
  ADD CONSTRAINT `Historique_ibfk_2` FOREIGN KEY (`id_operateur`) REFERENCES `Operateur` (`id_operateur`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `Lieu`
--
ALTER TABLE `Lieu`
  ADD CONSTRAINT `fk_zone` FOREIGN KEY (`id_zone`) REFERENCES `ZoneGeographique` (`id_zone`),
  ADD CONSTRAINT `Lieu_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE;

--
-- Contraintes pour la table `Meteo`
--
ALTER TABLE `Meteo`
  ADD CONSTRAINT `Meteo_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE;

--
-- Contraintes pour la table `Operateur`
--
ALTER TABLE `Operateur`
  ADD CONSTRAINT `Operateur_ibfk_1` FOREIGN KEY (`id_motdepasse`) REFERENCES `MotDePasse` (`id_motdepasse`) ON DELETE SET NULL;

--
-- Contraintes pour la table `Rapport`
--
ALTER TABLE `Rapport`
  ADD CONSTRAINT `Rapport_ibfk_1` FOREIGN KEY (`id_operateur`) REFERENCES `Operateur` (`id_operateur`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Rapport_ibfk_2` FOREIGN KEY (`id_type_evenement`) REFERENCES `TypeEvenement` (`id_type_evenement`) ON DELETE SET NULL,
  ADD CONSTRAINT `Rapport_ibfk_3` FOREIGN KEY (`id_sous_type_evenement`) REFERENCES `SousTypeEvenement` (`id_sous_type_evenement`) ON DELETE SET NULL,
  ADD CONSTRAINT `Rapport_ibfk_4` FOREIGN KEY (`id_origine_evenement`) REFERENCES `OrigineEvenement` (`id_origine_evenement`) ON DELETE SET NULL;

--
-- Contraintes pour la table `Source`
--
ALTER TABLE `Source`
  ADD CONSTRAINT `Source_ibfk_1` FOREIGN KEY (`id_rapport`) REFERENCES `Rapport` (`id_rapport`) ON DELETE CASCADE,
  ADD CONSTRAINT `Source_ibfk_2` FOREIGN KEY (`id_operateur`) REFERENCES `Operateur` (`id_operateur`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `SousTypeEvenement`
--
ALTER TABLE `SousTypeEvenement`
  ADD CONSTRAINT `SousTypeEvenement_ibfk_1` FOREIGN KEY (`id_type_evenement`) REFERENCES `TypeEvenement` (`id_type_evenement`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
