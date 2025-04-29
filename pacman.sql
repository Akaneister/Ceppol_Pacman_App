-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : Marine:3306
-- Généré le : mar. 29 avr. 2025 à 14:00
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
(8, 26, 1, 1, '2025-04-29 13:34:25'),
(9, 26, 2, 0, '2025-04-29 13:53:42');

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
  `pne` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Alerte`
--

INSERT INTO `Alerte` (`id_alerte`, `id_rapport`, `cedre`, `cross_contact`, `smp`, `bsaa`, `delai_appareillage_bsaa`, `polrep`, `message_polrep`, `photo`, `derive_mothym`, `pne`) VALUES
(12, 26, 0, 1, 0, 0, NULL, 0, NULL, 1, 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `Cible`
--

CREATE TABLE `Cible` (
  `id_cible` int NOT NULL,
  `id_rapport` int NOT NULL,
  `nom` varchar(200) NOT NULL,
  `pavillon` varchar(100) DEFAULT NULL,
  `id_type_cible` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Cible`
--

INSERT INTO `Cible` (`id_cible`, `id_rapport`, `nom`, `pavillon`, `id_type_cible`) VALUES
(17, 26, 'Luther', 'Luther', 1);

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
  `type_action` varchar(20) NOT NULL,
  `detail_action` text,
  `date_action` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(17, 26, 'Luther', 43.25830600, 5.03958500, 3);

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
  `nebulosite` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Meteo`
--

INSERT INTO `Meteo` (`id_meteo`, `id_rapport`, `direction_vent`, `force_vent`, `etat_mer`, `nebulosite`) VALUES
(17, 26, 'NE', '2', '6', '2');

-- --------------------------------------------------------

--
-- Structure de la table `MotDePasse`
--

CREATE TABLE `MotDePasse` (
  `id_motdepasse` int NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `MotDePasse`
--

INSERT INTO `MotDePasse` (`id_motdepasse`, `mot_de_passe`, `date_creation`, `date_modification`) VALUES
(1, 'supersecure123', '2025-04-23 07:44:40', '2025-04-23 07:44:40');

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
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `Rapport`
--

INSERT INTO `Rapport` (`id_rapport`, `titre`, `date_evenement`, `description_globale`, `id_operateur`, `id_type_evenement`, `id_sous_type_evenement`, `id_origine_evenement`, `date_creation`, `date_modification`) VALUES
(26, 'Luther', '2025-04-29 13:34:00', 'Luther', 1, 2, 5, 1, '2025-04-29 13:34:25', '2025-04-29 13:34:25');

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
(1, 'Porte-conteneurs');

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
  MODIFY `id_acces` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `Alerte`
--
ALTER TABLE `Alerte`
  MODIFY `id_alerte` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `Cible`
--
ALTER TABLE `Cible`
  MODIFY `id_cible` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `Commentaire`
--
ALTER TABLE `Commentaire`
  MODIFY `id_commentaire` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Historique`
--
ALTER TABLE `Historique`
  MODIFY `id_historique` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Lieu`
--
ALTER TABLE `Lieu`
  MODIFY `id_lieu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `Meteo`
--
ALTER TABLE `Meteo`
  MODIFY `id_meteo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `MotDePasse`
--
ALTER TABLE `MotDePasse`
  MODIFY `id_motdepasse` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id_rapport` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pour la table `Source`
--
ALTER TABLE `Source`
  MODIFY `id_source` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `SousTypeEvenement`
--
ALTER TABLE `SousTypeEvenement`
  MODIFY `id_sous_type_evenement` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `TypeCible`
--
ALTER TABLE `TypeCible`
  MODIFY `id_type_cible` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
