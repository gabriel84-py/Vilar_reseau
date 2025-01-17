"""Concept
1. Fonctionnalités de base :
Création de compte utilisateur : Permettre aux utilisateurs de s'inscrire et de se connecter.
Profils utilisateurs : Chaque utilisateur a un profil avec des informations personnelles, une photo de profil, et une biographie.
Ajout d'amis : Les utilisateurs peuvent envoyer des demandes d'amis et accepter ou refuser celles des autres.
Fil d'actualités : Un fil d'actualités où les utilisateurs peuvent voir les mises à jour de leurs amis (publications, photos, etc.).
Publications : Les utilisateurs peuvent publier des textes, des images ou des vidéos.
Commentaires et likes : Les utilisateurs peuvent commenter et aimer les publications des autres.
2. Fonctionnalités avancées :
Messagerie privée : Permettre aux utilisateurs d'envoyer des messages directs.
Groupes : Créer des groupes où les utilisateurs peuvent discuter autour de centres d'intérêt communs.
Événements : Permettre aux utilisateurs de créer et de gérer des événements.
Notifications : Alerter les utilisateurs des nouvelles interactions (likes, commentaires, demandes d'amis).
Comment y arriver
Choix de la technologie :
Backend : Utilise un framework comme Flask ou Django pour gérer le serveur et les requêtes.
Frontend : Utilise HTML, CSS et JavaScript (ou un framework comme React ou Vue.js) pour créer l'interface utilisateur.
Base de données : Utilise une base de données comme SQLite, PostgreSQL ou MongoDB pour stocker les données des utilisateurs et des publications.
2. Architecture de l'application :
Modèle de données : Crée des modèles pour les utilisateurs, les publications, les amis, les commentaires, etc.
API REST : Développe une API pour gérer les interactions entre le frontend et le backend.
3. Développement étape par étape :
Phase 1 : Commence par la création de comptes utilisateurs et la gestion des profils.
Phase 2 : Ajoute la fonctionnalité d'ajout d'amis et de fil d'actualités.
Phase 3 : Implémente les publications, les commentaires et les likes.
Phase 4 : Ajoute des fonctionnalités avancées comme la messagerie et les groupes.
4. Tests et déploiement :
Tests : Écris des tests pour vérifier que chaque fonctionnalité fonctionne correctement.
Déploiement : Utilise des services comme Heroku ou AWS pour déployer ton application en ligne.
Améliorations futures :
Sécurité : Implémente des mesures de sécurité pour protéger les données des utilisateurs.
Scalabilité : Prépare ton application à gérer un grand nombre d'utilisateurs et de données."""


import flask
import time


app = flask.Flask(__name__)

@app.route("/home")

def home():
    return"<h1>hello world !</h1>"

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port='5000')