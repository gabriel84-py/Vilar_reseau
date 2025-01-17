const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const printer = require('pdf-to-printer');

// Initialiser l'application express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuration de session
app.use(session({
  secret: 'secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Mettre à true en production avec HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Définir l'endroit où les fichiers seront stockés
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function(req, file, cb) {
    // Conserver le nom d'origine du fichier
    cb(null, file.originalname);
  }
});

// Configurer multer avec des restrictions minimales
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite à 10MB
  }
});

// Middleware d'authentification renforcé
const requireAuth = (req, res, next) => {
  // Vérifier si l'utilisateur est authentifié via la session
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  // Vérifier si l'utilisateur existe toujours dans la base
  if (!users[req.session.user]) {
    req.session.destroy();
    return res.redirect('/login');
  }

  // Ajouter une vérification du referer pour éviter les accès directs
  const referer = req.headers.referer;
  if (!referer || !referer.includes(req.headers.host)) {
    return res.redirect('/login');
  }

  next();
};

// Route de login - doit être avant les autres middlewares
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Protection globale des routes après /login
app.use((req, res, next) => {
  if (req.path === '/login') {
    return next();
  }
  requireAuth(req, res, next);
});

// Middleware pour servir les fichiers statiques - après requireAuth
app.use(express.static(__dirname));

// Base de données utilisateurs (en mémoire pour cet exemple)
const users = {
  'Elisa': { password: 'Elisa06!' },
  'Estelle': { password: 'Estelle09!' },
  'Gabriel': { password: 'Gabriel03!' },
  'Jerome': { password: 'Jerome10!' },
  'Augustin': { password: 'Augustinbest!' }
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] && users[username].password === password) {
    req.session.user = username;
    req.session.save((err) => {
      if (err) {
        console.error('Erreur de sauvegarde de session:', err);
        return res.redirect('/login?error=1');
      }
      res.redirect('/');
    });
  } else {
    res.redirect('/login?error=1');
  }
});

// Route principale - Doit être avant les autres routes et protégée
app.get('/', requireAuth, (req, res) => {
  // Double vérification de l'authentification
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint pour recevoir des fichiers
app.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un fichier'
      });
    }
    
    console.log('Fichier reçu:', req.file);
    res.json({ 
      success: true, 
      filePath: req.file.filename,
      originalName: req.file.originalname 
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier'
    });
  }
});

// Endpoint pour envoyer des fichiers
app.get('/download/:filename', requireAuth, (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, req.params.filename, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement:', err);
        res.status(500).send('Erreur lors du téléchargement du fichier');
      }
    });
  } else {
    res.status(404).send('Fichier non trouvé');
  }
});

// Nouvel endpoint pour l'impression
app.post('/print', async (req, res) => {
  try {
    const { filePath } = req.body;
    const fullPath = path.join(__dirname, 'uploads', filePath);
    
    // Vérifiez si le fichier existe
    if (!fs.existsSync(fullPath)) {
      return res.json({ success: false, message: 'Fichier non trouvé' });
    }

    // Lancer l'impression
    await printer.print(fullPath, {
      printer: 'HP ENVY Photo 6200 series [C3072C]', // Remplacez par le nom de votre imprimante
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de l\'impression:', error);
    res.json({ success: false, message: error.message });
  }
});

// Gérer les connexions WebSocket pour notifier les transferts
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');
  
  socket.on('fileTransfer', (fileInfo) => {
    console.log('Fichier transféré:', fileInfo);
    socket.broadcast.emit('fileTransfer', fileInfo);
  });

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
});

// Créer le fichier login.html s'il n'existe pas
const loginHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Transfert de Fichiers</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #1a1c20 0%, #2d3436 100%);
            color: #ffffff;
            height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 400px;
        }
        
        h1 {
            text-align: center;
            color: #4facfe;
            margin-bottom: 30px;
            font-size: 2em;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: none;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            color: white;
            font-size: 16px;
            margin-top: 5px;
        }
        
        input:focus {
            outline: 2px solid #4facfe;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        .error-message {
            color: #ff6b6b;
            text-align: center;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>Connexion</h1>
        <form action="/login" method="POST">
            <div class="form-group">
                <input type="text" name="username" placeholder="Nom d'utilisateur" required>
            </div>
            <div class="form-group">
                <input type="password" name="password" placeholder="Mot de passe" required>
            </div>
            <button type="submit">Se connecter</button>
            <div class="error-message"></div>
        </form>
    </div>
</body>
</html>
`;

if (!fs.existsSync(path.join(__dirname, 'login.html'))) {
  fs.writeFileSync(path.join(__dirname, 'login.html'), loginHTML);
}

// Démarrer le serveur sur le port 3000
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
