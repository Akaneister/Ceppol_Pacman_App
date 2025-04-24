-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : Marine:3306
-- Généré le : jeu. 24 avr. 2025 à 08:18
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
(9, 'Pollution maritime', '2025-04-22 12:30:00', 'Observation d\'une nappe d\'hydrocarbures', 1, 2, 5, 3, '2025-04-24 08:12:09', '2025-04-24 08:12:09');

--
-- Index pour les tables déchargées
--

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
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `Rapport`
--
ALTER TABLE `Rapport`
  MODIFY `id_rapport` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `Rapport`
--
ALTER TABLE `Rapport`
  ADD CONSTRAINT `Rapport_ibfk_1` FOREIGN KEY (`id_operateur`) REFERENCES `Operateur` (`id_operateur`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Rapport_ibfk_2` FOREIGN KEY (`id_type_evenement`) REFERENCES `TypeEvenement` (`id_type_evenement`) ON DELETE SET NULL,
  ADD CONSTRAINT `Rapport_ibfk_3` FOREIGN KEY (`id_sous_type_evenement`) REFERENCES `SousTypeEvenement` (`id_sous_type_evenement`) ON DELETE SET NULL,
  ADD CONSTRAINT `Rapport_ibfk_4` FOREIGN KEY (`id_origine_evenement`) REFERENCES `OrigineEvenement` (`id_origine_evenement`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
