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


from flask import Flask, request, render_template, redirect, url_for
import os 

app = Flask(__name__)

usernamesok = ["gabriel"]
go_to_login_verif = False
chemin_fichier = "/Users/gabrieljeanvermeille/venv/bin/Vilar_reseau/mdp.txt"

@app.route('/')
def principale():
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])

def login():
    global chemin_fichier
    global usernamesok
    global go_to_login_verif
    global inlycee
    if request.method == 'POST':
        new_username = request.form.get('new_username')
        username = request.form.get('username')
        inlycee = request.form.get('in_lycée')
        if new_username:
            if inlycee == "C":    
                usernamesok.append(new_username)
                with open(chemin_fichier, 'a') as fichier:
                    fichier.write(new_username + '\n')  
                print(f'nwbie : {new_username}')
        print(f"Username reçu : {username}")
        if username in usernamesok:
            go_to_login_verif = True
            return redirect(url_for('home', username=username))
        else:
            return render_template("login.html", error="Mauvais mdp !")
    return render_template('login.html')

@app.route('/home') 

def home():
    global go_to_login_verif
    if go_to_login_verif == True:
        username = request.args.get('username')
        go_to_login_verif = False
        return render_template('home.html', username=username)
    else:
        return redirect('/login')

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port='5000')