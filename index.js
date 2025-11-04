
const express = require('express');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, addDoc } = require('firebase/firestore');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Firebase (reemplaza con tus credenciales)
const firebaseConfig = {
  apiKey: "AIzaSyAgja9DNXFZ1GFqXQW6gfdmQc332swF-7g",
  authDomain: "proyecto-ef176.firebaseapp.com",
  projectId: "proyecto-ef176",
  storageBucket: "proyecto-ef176.firebasestorage.app",
  messagingSenderId: "953870791085",
  appId: "1:953870791085:web:4a414c3b57eacf98b77124",
  measurementId: "G-LNJHBLN7ZK"
};

// Inicializar Firebase
console.log('Inicializando Firebase...');
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
console.log('Firebase inicializado correctamente');

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware para logging de peticiones (útil para debug en producción)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Almacenamiento en memoria (temporal)
const juegos = [];

// Views (EJS)
// Intentional check: requerir 'ejs' al inicio para producir un error claro si falta.
try {
	// intentamos resolver la ruta y requerirlo para detectar problemas temprano
	const ejsPath = require.resolve('ejs');
	require('ejs');
	console.log('EJS cargado desde:', ejsPath);
	// Información diagnóstica para problemas de resolución de módulos
	console.log('process.cwd():', process.cwd());
	console.log('__dirname:', __dirname);
	console.log('module.paths:', module.paths);
} catch (err) {
	console.error('ERROR al cargar "ejs" - asegúrate de ejecutar `npm install` en la carpeta del proyecto.');
	console.error(err && err.stack ? err.stack : err);
	console.log('process.cwd():', process.cwd());
	console.log('__dirname:', __dirname);
	console.log('module.paths:', module.paths);
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets: imágenes y media
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/media', express.static(path.join(__dirname, 'media')));

// Servir archivos estáticos (CSS, JS, imágenes públicas).
// Se expone la carpeta `public/` para assets como styles.css
app.use(express.static(path.join(__dirname, 'public')));
// También servir la carpeta views como estática para acceder a styles.css
app.use(express.static(path.join(__dirname, 'views')));

// Ruta de diagnóstico (para verificar que el servidor está funcionando)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    views: app.get('views'),
    firebase: firebaseConfig.projectId
  });
});

// Rutas principales (mapeamos los enlaces .html usados en las vistas a rutas dinámicas)
// Ruta principal - muestra el login
app.get('/', (req, res) => {
  try {
    console.log('Renderizando página de inicio...');
    res.render('inicio', { error: null });
  } catch (error) {
    console.error('Error al renderizar inicio:', error);
    res.status(500).send('Error al cargar la página: ' + error.message);
  }
});

// Ruta POST para procesar el login
app.post('/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    
    console.log('=== INTENTO DE LOGIN ===');
    console.log('Usuario recibido:', usuario);
    console.log('Contraseña recibida:', contrasena);

    if (!usuario || !contrasena) {
      return res.status(400).render('inicio', { 
        error: 'Por favor ingrese usuario y contraseña' 
      });
    }

    // Buscar usuario en la colección 'usuarios' de Firebase
    console.log('Buscando en Firebase...');
    const usuariosRef = collection(db, 'usuarios');
    
    // Primero obtenemos TODOS los usuarios para ver qué hay en la base de datos
    const allUsers = await getDocs(usuariosRef);
    console.log('Total de usuarios en Firebase:', allUsers.size);
    
    allUsers.forEach((doc) => {
      console.log('Usuario encontrado:', {
        id: doc.id,
        data: doc.data()
      });
    });
    
    // Ahora hacemos la búsqueda específica (usando 'contraseña' con ñ)
    const q = query(usuariosRef, where('usuario', '==', usuario), where('contraseña', '==', contrasena));
    const querySnapshot = await getDocs(q);
    
    console.log('Resultados de la búsqueda:', querySnapshot.size);

    if (querySnapshot.empty) {
      return res.status(401).render('inicio', { 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // Login exitoso - redirigir a index
    console.log('¡Login exitoso!');
    res.redirect('/home');

  } catch (error) {
    console.error('Error al verificar usuario:', error);
    console.error('Stack completo:', error.stack);
    res.status(500).render('inicio', { 
      error: 'Error al procesar el login: ' + error.message 
    });
  }
});

// Ruta para home (después del login exitoso)
app.get(['/home', '/index.html'], (req, res) => res.render('index'));

// Ruta GET para mostrar el formulario de registro
app.get(['/registrar', '/registrar.html', '/registro'], (req, res) => {
  res.render('registrar', { error: null, success: null, redirect: false });
});

// Ruta POST para procesar el registro
app.post('/registro', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    
    console.log('=== INTENTO DE REGISTRO ===');
    console.log('Usuario:', usuario);

    // Validar que los campos no estén vacíos
    if (!usuario || !contrasena) {
      return res.status(400).render('registrar', { 
        error: 'Por favor complete todos los campos',
        success: null
      });
    }

    // Validar longitud mínima
    if (usuario.trim().length < 3) {
      return res.status(400).render('registrar', { 
        error: 'El usuario debe tener al menos 3 caracteres',
        success: null
      });
    }

    if (contrasena.length < 4) {
      return res.status(400).render('registrar', { 
        error: 'La contraseña debe tener al menos 4 caracteres',
        success: null
      });
    }

    // Verificar si el usuario ya existe
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('usuario', '==', usuario.trim()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res.status(400).render('registrar', { 
        error: 'El usuario ya existe. Por favor elige otro nombre.',
        success: null
      });
    }

    // Crear el nuevo usuario en Firebase
    await addDoc(usuariosRef, {
      usuario: usuario.trim(),
      contraseña: contrasena
    });

    console.log('¡Usuario registrado exitosamente!');

    // Mostrar mensaje de éxito y redirigir
    return res.render('registrar', { 
      error: null,
      success: '¡Usuario registrado exitosamente! Redirigiendo al inicio...',
      redirect: true
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    console.error('Stack completo:', error.stack);
    res.status(500).render('registrar', { 
      error: 'Error al registrar el usuario: ' + error.message,
      success: null
    });
  }
});

app.get(['/catalogo', '/catalogo.html'], (req, res) => res.render('catalogo'));

// Mostrar el formulario para agregar un juego
app.get(['/agregar', '/agregar.html'], (req, res) => {
	res.render('agregar', { errors: [], success: null, game: {} });
});

// Procesar el formulario de agregar
// Validación común para agregar/modificar
const validateGame = (data) => {
  const errors = [];
  if (!data.name || !data.name.trim()) errors.push('El nombre es obligatorio');
  if (!data.description || !data.description.trim()) errors.push('La descripción es obligatoria');
  if (!data.price || isNaN(parseFloat(data.price))) errors.push('El precio es obligatorio y debe ser numérico');
  if (!data.platform || !data.platform.trim()) errors.push('La plataforma o categoría es obligatoria');
  if (!data.imageUrl || !data.imageUrl.trim()) errors.push('La URL de la imagen es obligatoria');
  return errors;
};


app.post('/agregar', (req, res) => {
  const { name, description, price, platform, imageUrl } = req.body || {};
  const errors = validateGame(req.body);

  const game = { name: (name||'').trim(), description: (description||'').trim(), price: parseFloat(price) || 0, platform: (platform||'').trim(), imageUrl: (imageUrl||'').trim() };

  if (errors.length) {
    return res.status(400).render('agregar', { errors, success: null, game: game });
  }

  // Guardamos en memoria con ID único
  game.id = Date.now().toString();
  juegos.push(game);

  // Renderizamos la misma vista con mensaje de éxito
  return res.render('agregar', { errors: [], success: 'Juego agregado correctamente', game: {} });
});

// Buscar y mostrar formulario de modificación
app.get(['/modificar', '/modificar.html'], (req, res) => {
  const query = (req.query.q || '').toLowerCase().trim();
  if (!query) {
    return res.render('modificar', { game: null, errors: [], success: null, searched: false });
  }

  const game = juegos.find(g => g.name.toLowerCase().includes(query));
  return res.render('modificar', { 
    game: game || null,
    errors: [],
    success: null,
    searched: true
  });
});

// Procesar modificación de un juego
app.post('/modificar/:id', (req, res) => {
  const { id } = req.params;
  const gameIndex = juegos.findIndex(g => g.id === id);

  if (gameIndex === -1) {
    return res.status(404).render('modificar', { 
      game: null,
      errors: ['Juego no encontrado'],
      success: null,
      searched: false
    });
  }

  const errors = validateGame(req.body);
  if (errors.length) {
    return res.status(400).render('modificar', {
      game: { ...req.body, id },
      errors,
      success: null,
      searched: true
    });
  }

  // Actualizar juego
  const updatedGame = {
    id,
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    price: parseFloat(req.body.price),
    platform: req.body.platform.trim(),
    imageUrl: req.body.imageUrl.trim()
  };

  juegos[gameIndex] = updatedGame;

  return res.render('modificar', {
    game: null,
    errors: [],
    success: 'Juego actualizado correctamente',
    searched: false
  });
});// Páginas de cada juego (las vistas existen en views/)
app.get(['/juego_horizon', '/juego_horizon.html', '/juego/horizon'], (req, res) => res.render('juego_horizon'));
app.get(['/juego_forest', '/juego_forest.html', '/juego/forest'], (req, res) => res.render('juego_forest'));
app.get(['/juego_ghost', '/juego_ghost.html', '/juego/ghost'], (req, res) => res.render('juego_ghost'));
app.get(['/juego_residentevil', '/juego_residentevil.html', '/juego/residentevil'], (req, res) => res.render('juego_residentevil'));

// Simple redirect patterns: si en las vistas hay enlaces relativos como juego_horizon.html
// también contemplamos /juego_horizon.html mediante las rutas anteriores.

// 404 handler
app.use((req, res) => {
	res.status(404);
	// Intentamos renderizar una vista 404 simple si existe, si no, enviamos texto
	try {
		return res.render('404');
	} catch (err) {
		return res.type('txt').send('404 - No encontrado');
	}
});

app.listen(PORT, () => {
	console.log(`Servidor arrancado en http://localhost:${PORT} (ENV PORT=${process.env.PORT || 'none'})`);
});
