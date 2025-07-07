-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : Marine:3306
-- Généré le : lun. 07 juil. 2025 à 07:42
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
(50, 59, 3, 1, '2025-06-26 08:00:53'),
(51, 59, 1, 1, '2025-07-02 13:39:13'),
(52, 60, 1, 1, '2025-07-03 08:07:10'),
(53, 61, 1, 1, '2025-07-03 08:13:17'),
(54, 62, 1, 1, '2025-07-03 08:13:45');

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
(39, 59, 1, 0, 0, 0, NULL, 0, NULL, 1, 0, 0, 0, 'Snsm', 'Navire', 'Marine', 'Aucun', 'Grosse pollution '),
(40, 60, 0, 0, 1, 0, NULL, 0, NULL, 0, 0, 0, 0, 'Mail', 'Mail', 'Mail', 'Mail', 'Mail'),
(41, 61, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL),
(42, 62, 0, 0, 0, 0, NULL, 0, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL);

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
(45, 59, 'Amoco', 'Espagne', '200030FLL', 'Fioul Lourd', '1000000L', 15),
(46, 60, 'Mail', 'Mail', 'Mail', 'Mail', 'Mail', 16);

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
(53, 59, 3, 'Observqtion', 'Test', '2025-06-30 16:34:10'),
(54, 59, 3, 'Test', 'TESTzjbfzjbfkezbefkjzbfbebzkkfez', '2025-06-30 16:35:44'),
(55, 59, 3, NULL, 'ttrfttftrcc', '2025-06-30 16:36:46'),
(56, 59, 1, 'AJOUT_D_ACCES', NULL, '2025-07-02 15:39:14');

-- --------------------------------------------------------

--
-- Structure de la table `Lien`
--

CREATE TABLE `Lien` (
  `id_lien` int NOT NULL,
  `titre` text,
  `url` varchar(600) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Lien`
--

INSERT INTO `Lien` (`id_lien`, `titre`, `url`) VALUES
(1, 'Marine Traffic', 'https://www.marinetraffic.com/fr/ais/home/centerx:1.6/centery:49.1/zoom:9'),
(2, 'Shom', 'https://data.shom.fr/'),
(3, 'Email', 'ceppol@intradef.fr\r\n');

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
(45, 59, 'Au dessus de Landunvez', 48.57516600, -4.70270200, 2),
(46, 60, 'Mail', 48.42832300, -4.76174900, 2),
(47, 61, NULL, NULL, NULL, 2),
(48, 62, NULL, NULL, NULL, 6);

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
(45, 59, 'N', '4', '1', '9', 'basse'),
(46, 60, NULL, NULL, NULL, NULL, NULL),
(47, 61, NULL, NULL, NULL, NULL, NULL),
(48, 62, NULL, NULL, NULL, NULL, NULL);

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
(1, 'user', '2025-04-23 07:44:40', '2025-06-17 11:52:49', 'Opérateur'),
(2, 'admin', '2025-05-19 13:47:55', '2025-06-17 11:51:02', 'Admin');

-- --------------------------------------------------------

--
-- Structure de la table `Operateur`
--

CREATE TABLE `Operateur` (
  `id_operateur` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Operateur`
--

INSERT INTO `Operateur` (`id_operateur`, `nom`, `prenom`, `date_creation`) VALUES
(1, 'LE REST', 'Thibault', '2025-04-23 08:02:33'),
(2, 'TOUZARD', 'Youna', '2025-04-23 08:02:33'),
(3, 'MIGNOT', 'Morgane', '2025-04-23 08:02:33'),
(4, 'LESVEN', 'Bruno', '2025-04-23 08:02:33'),
(5, 'DEGRENNE', 'Jean-Sébastien', '2025-04-23 08:02:33'),
(6, 'PORCHE', 'François', '2025-04-23 08:02:33'),
(7, 'LE GAREC', 'Yann', '2025-04-23 08:02:33'),
(8, 'MAGUEUR', 'Gérald', '2025-04-23 08:02:33');

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
(59, 'Collisions Amoco', '2025-06-26 11:59:00', 'Probléme', 3, 1, 1, 1, '2025-06-26 08:00:53', '2025-06-26 08:00:53', 0),
(60, 'Mail', '2025-07-03 12:06:00', 'Mail', 1, 2, 6, 3, '2025-07-03 08:07:10', '2025-07-03 08:07:10', 0),
(61, 'test', '2025-07-03 10:07:00', 'f', 1, 2, NULL, NULL, '2025-07-03 08:13:17', '2025-07-03 08:13:17', 0),
(62, 'tt', '2025-07-03 10:13:00', 't', 1, 2, NULL, NULL, '2025-07-03 08:13:45', '2025-07-03 08:13:45', 0);

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
(1, 'Numéros Importants', 'Numeros_Importants_Pollution_Marine.pdf', 'pdf'),
(2, 'Canutec Guide des mesures d\'urgence', '2024-guide-de-mesures-durgence.pdf', 'pdf'),
(4, 'Annuaire Urgence CEPPOL - Appli Web', 'Annuaire_Urgence_CEPPOL_-_Appli_Web.docx', 'docx'),
(5, 'Calcul simple Quantité POLREP', 'Calcul_simple_Quantite_POLREP.xls', 'xls'),
(6, 'CEPPOL - Missions Responsabilités', 'CEPPOL_-_Missions_Responsabilites.pptx', 'pptx'),
(7, 'Code Apparence Accrods de Bonn', 'Code_Apparence_Accrods_de_Bonn.docx', 'docx'),
(8, 'Correlation surface-irisation', 'Correlation_surface-irisation.jpg', 'jpg'),
(11, 'Fiche initiale de suivi d\'incident maritime', 'Fiche_initiale_de_suivi_d\'incident_maritime.pdf', 'pdf'),
(12, 'Limite Météo Matériels', 'Limite_Meteo_Materiels.pdf', 'pdf'),
(13, 'Schéma Directeur METRO', 'Schema_Directeur_METRO.pdf', 'pdf'),
(14, 'Schéma Directeur OME', 'Schema_Directeur_OME.pdf', 'pdf');

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
(12, 'Meteo'),
(13, 'TestNew'),
(14, 'TestBuild'),
(15, 'Petrolier'),
(16, 'Mail');

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
-- Index pour la table `Lien`
--
ALTER TABLE `Lien`
  ADD PRIMARY KEY (`id_lien`),
  ADD UNIQUE KEY `Lien` (`url`);

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
  ADD PRIMARY KEY (`id_operateur`);

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
  MODIFY `id_acces` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT pour la table `Alerte`
--
ALTER TABLE `Alerte`
  MODIFY `id_alerte` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `Cible`
--
ALTER TABLE `Cible`
  MODIFY `id_cible` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT pour la table `Commentaire`
--
ALTER TABLE `Commentaire`
  MODIFY `id_commentaire` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Historique`
--
ALTER TABLE `Historique`
  MODIFY `id_historique` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT pour la table `Lien`
--
ALTER TABLE `Lien`
  MODIFY `id_lien` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `Lieu`
--
ALTER TABLE `Lieu`
  MODIFY `id_lieu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT pour la table `Meteo`
--
ALTER TABLE `Meteo`
  MODIFY `id_meteo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT pour la table `MotDePasse`
--
ALTER TABLE `MotDePasse`
  MODIFY `id_motdepasse` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `Operateur`
--
ALTER TABLE `Operateur`
  MODIFY `id_operateur` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `OrigineEvenement`
--
ALTER TABLE `OrigineEvenement`
  MODIFY `id_origine_evenement` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `Rapport`
--
ALTER TABLE `Rapport`
  MODIFY `id_rapport` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT pour la table `Ressource`
--
ALTER TABLE `Ressource`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
  MODIFY `id_type_cible` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
