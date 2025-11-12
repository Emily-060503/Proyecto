
// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc } = require('firebase/firestore');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const debugLog = (...args) => { if (!isProd) console.log(...args); };

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
debugLog('Inicializando Firebase...');
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
debugLog('Firebase inicializado correctamente');

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware de logging solo en desarrollo
if (!isProd) {
  // Logging básico de peticiones
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
  });

  // Logging de respuestas 404
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode === 404) {
        console.log(`❌ 404 Not Found: ${req.url}`);
      }
      originalSend.call(this, data);
    };
    next();
  });
}

// (Eliminado almacenamiento en memoria: ahora todo viene de Firestore)

// Views (EJS)
// Intentional check: requerir 'ejs' al inicio para producir un error claro si falta.
try {
  // intentamos resolver la ruta y requerirlo para detectar problemas temprano
  const ejsPath = require.resolve('ejs');
  require('ejs');
  debugLog('EJS cargado desde:', ejsPath);
  // Información diagnóstica (solo en desarrollo)
  debugLog('process.cwd():', process.cwd());
  debugLog('__dirname:', __dirname);
  debugLog('module.paths:', module.paths);
} catch (err) {
  console.error('ERROR al cargar "ejs" - asegúrate de ejecutar `npm install` en la carpeta del proyecto.');
  console.error(err && err.stack ? err.stack : err);
  if (!isProd) {
    console.log('process.cwd():', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('module.paths:', module.paths);
  }
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets: imágenes y media
const imgPath = path.join(__dirname, 'img');
const mediaPath = path.join(__dirname, 'media');
const publicPath = path.join(__dirname, 'public');
const viewsPath = path.join(__dirname, 'views');

debugLog('Configurando rutas estáticas:');
debugLog('- img:', imgPath);
debugLog('- media:', mediaPath);
debugLog('- public:', publicPath);
debugLog('- views:', viewsPath);

app.use('/img', express.static(imgPath));
app.use('/media', express.static(mediaPath));

// Servir archivos estáticos (CSS, JS, imágenes públicas).
// Se expone la carpeta `public/` para assets como styles.css
app.use(express.static(publicPath));
// Nota: no exponemos la carpeta de vistas como estática por seguridad

// Rutas de diagnóstico solo en desarrollo
if (!isProd) {
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      views: app.get('views'),
      firebase: firebaseConfig.projectId
    });
  });

  app.get('/test-firebase', async (req, res) => {
    try {
      console.log('=== TEST DE FIREBASE ===');
      const productosRef = collection(db, 'productos');
      const querySnapshot = await getDocs(productosRef);
      
      const productos = [];
      querySnapshot.forEach((doc) => {
        productos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      res.json({
        status: 'OK',
        message: 'Conexión con Firebase exitosa',
        totalProductos: productos.length,
        productos: productos
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: error.message,
        stack: error.stack
      });
    }
  });
}

// Rutas principales (mapeamos los enlaces .html usados en las vistas a rutas dinámicas)
// Ruta principal - muestra el login
app.get('/', (req, res) => {
  try {
    debugLog('Renderizando página de inicio...');
    res.render('inicio', { error: null });
  } catch (error) {
    console.error('Error al renderizar inicio:', error);
    res.status(500).send('Error al cargar la página: ' + error.message);
  }
});

// Alias para compatibilidad con enlaces tipo /inicio y /inicio.html
app.get(['/inicio', '/inicio.html'], (req, res) => {
  try {
    debugLog('Renderizando alias de inicio (/inicio*.html)...');
    res.render('inicio', { error: null });
  } catch (error) {
    console.error('Error al renderizar alias de inicio:', error);
    res.status(500).send('Error al cargar la página: ' + error.message);
  }
});

// Ruta POST para procesar el login
app.post('/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    
    debugLog('=== INTENTO DE LOGIN ===');
    debugLog('Usuario recibido:', usuario);

    if (!usuario || !contrasena) {
      return res.status(400).render('inicio', { 
        error: 'Por favor ingrese usuario y contraseña' 
      });
    }

    // Buscar usuario en la colección 'usuarios' de Firebase
    debugLog('Buscando en Firebase...');
    const usuariosRef = collection(db, 'usuarios');
    
    // Obtenemos usuarios para diagnosticar cantidad (solo en desarrollo)
    const allUsers = await getDocs(usuariosRef);
    debugLog('Total de usuarios en Firebase:', allUsers.size);
    
    // Ahora hacemos la búsqueda específica (usando 'contraseña' con ñ)
    const q = query(usuariosRef, where('usuario', '==', usuario), where('contraseña', '==', contrasena));
    const querySnapshot = await getDocs(q);
    
  debugLog('Resultados de la búsqueda:', querySnapshot.size);

    if (querySnapshot.empty) {
      return res.status(401).render('inicio', { 
        error: 'Usuario o contraseña incorrectos' 
      });
    }

    // Login exitoso - redirigir a index
  debugLog('¡Login exitoso!');
    res.redirect('/home');

  } catch (error) {
    console.error('Error al verificar usuario:', error);
    console.error('Stack completo:', error.stack);
    res.status(500).render('inicio', { 
      error: 'Error al procesar el login: ' + error.message 
    });
  }
});

// Ruta para home (después del login exitoso) con búsqueda
app.get(['/home', '/index.html'], async (req, res) => {
  try {
    const searchQuery = (req.query.q || '').trim().toLowerCase();
    
    // Obtener productos de Firestore
    const productosRef = collection(db, 'productos');
    const querySnapshot = await getDocs(productosRef);
    
    let juegos = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      juegos.push({
        id: doc.id,
        ...data
      });
    });
    
    // Si hay búsqueda, filtrar
    if (searchQuery) {
      juegos = juegos.filter(juego => {
        const nombre = (juego.nombre || '').toLowerCase();
        const descripcion = (juego.descripcion || '').toLowerCase();
        return nombre.includes(searchQuery) || descripcion.includes(searchQuery);
      });
    } else {
      // Si no hay búsqueda, mostrar los 4 productos con menor precio
      juegos = juegos
        .map(j => ({ ...j, precioNum: parseFloat(j.precio) || 999999 }))
        .sort((a, b) => a.precioNum - b.precioNum)
        .slice(0, 4);
    }
    
    res.render('index', { juegos, searchQuery: searchQuery || '' });
  } catch (error) {
    console.error('Error en búsqueda desde home:', error);
    res.render('index', { juegos: [], searchQuery: '' });
  }
});

// Ruta GET para mostrar el formulario de registro
app.get(['/registrar', '/registrar.html', '/registro'], (req, res) => {
  res.render('registrar', { error: null, success: null, redirect: false });
});

// Ruta POST para procesar el registro
app.post('/registro', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    
  debugLog('=== INTENTO DE REGISTRO ===');
  debugLog('Usuario:', usuario);

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

// Ruta para mostrar el catálogo con productos de Firebase
app.get(['/catalogo', '/catalogo.html'], async (req, res) => {
  try {
    const searchQuery = (req.query.q || '').trim().toLowerCase();
    debugLog('=== CARGANDO CATÁLOGO ===');
    debugLog('Intentando conectar con Firebase...');
    const productosRef = collection(db, 'productos');
    debugLog('Referencia a colección creada');
    
    const querySnapshot = await getDocs(productosRef);
    debugLog('Query ejecutado. Documentos encontrados:', querySnapshot.size);
    
  const juegos = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filtrar si hay búsqueda
      if (searchQuery) {
        const nombre = (data.nombre || '').toLowerCase();
        const descripcion = (data.descripcion || '').toLowerCase();
        if (!nombre.includes(searchQuery) && !descripcion.includes(searchQuery)) {
          return; // Skip este documento
        }
      }
      
      juegos.push({
        id: doc.id,
        ...data
      });
    });
    
    debugLog(`Total de productos en array: ${juegos.length}`);
    res.render('catalogo', { juegos, searchQuery: searchQuery || '' });
  } catch (error) {
    console.error('❌ Error al cargar catálogo:', error);
    console.error('Stack:', error.stack);
    res.status(500).render('catalogo', { juegos: [] });
  }
});

// Endpoint de búsqueda para sugerencias en vivo (JSON)
app.get('/buscar', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.json({ results: [] });

    const productosRef = collection(db, 'productos');
    const snap = await getDocs(productosRef);
    const results = [];
    snap.forEach(d => {
      const data = d.data();
      const nombre = (data.nombre || '').toLowerCase();
      const descripcion = (data.descripcion || '').toLowerCase();
      if (nombre.includes(q) || descripcion.includes(q)) {
        results.push({ id: d.id, nombre: data.nombre || '', imagen: data.imagen || '', precio: data.precio || '', descripcion: data.descripcion || '' });
      }
    });
    res.json({ results });
  } catch (err) {
    console.error('Error en /buscar:', err);
    res.status(500).json({ results: [], error: 'Error de búsqueda' });
  }
});

// Ruta para mostrar detalles de un producto específico
app.get(['/detalles/:id', '/detalles'], async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).send('ID de producto no proporcionado');
    }
    
    debugLog(`Cargando detalles del producto ${id}...`);
    const productoRef = doc(db, 'productos', id);
    const productoDoc = await getDoc(productoRef);
    
    if (!productoDoc.exists()) {
      return res.status(404).render('404');
    }
    
    const producto = {
      id: productoDoc.id,
      ...productoDoc.data()
    };
    
  debugLog('Producto encontrado:', producto.nombre);
    res.render('detalles', producto);
  } catch (error) {
    console.error('Error al cargar detalles:', error);
    res.status(500).send('Error al cargar los detalles del producto');
  }
});

// Mostrar el formulario para agregar un juego
app.get(['/agregar', '/agregar.html'], (req, res) => {
	res.render('agregar', { errors: [], success: null, productos: {} });
});


// Procesar formulario de agregar: guardar en Firestore en la colección 'productos'
app.post('/agregar', async (req, res) => {
  try {
    // Aceptamos campos con nombres: nombre, precio, descripcion, imagen, video, imagen1..3, detalles, min_*, rec_*
    const body = req.body || {};
    const nombre = (body.nombre || body.name || '').trim();
    const descripcion = (body.descripcion || body.description || '').trim();
    const precio = (body.precio || body.price || '').toString();
    const imagen = (body.imagen || body.imageUrl || '').trim();

    const requiredErrors = [];
    if (!nombre) requiredErrors.push('El nombre es obligatorio');
    if (!descripcion) requiredErrors.push('La descripción es obligatoria');
    if (!precio) requiredErrors.push('El precio es obligatorio');
    if (!imagen) requiredErrors.push('La URL de la imagen es obligatoria');

    if (requiredErrors.length) {
      return res.status(400).render('agregar', { errors: requiredErrors, success: null, productos: body });
    }

    const productosRef = collection(db, 'productos');
    const newDoc = await addDoc(productosRef, {
      nombre,
      precio,
      descripcion,
      imagen,
      video: body.video || '',
      imagen1: body.imagen1 || '',
      imagen2: body.imagen2 || '',
      imagen3: body.imagen3 || '',
      detalles: body.detalles || '',
      min_SO: body.min_SO || '',
      min_CPU: body.min_CPU || '',
      min_RAM: body.min_RAM || '',
      min_GPU: body.min_GPU || '',
      min_ALM: body.min_ALM || '',
      rec_SO: body.rec_SO || '',
      rec_CPU: body.rec_CPU || '',
      rec_RAM: body.rec_RAM || '',
      rec_GPU: body.rec_GPU || '',
      rec_ALM: body.rec_ALM || ''
    });

  debugLog('Producto creado con ID:', newDoc.id);
    // Redirigir al catálogo
    return res.redirect('/catalogo');
  } catch (error) {
    console.error('Error al agregar producto:', error);
    return res.status(500).render('agregar', { errors: ['Error al guardar el producto'], success: null, productos: req.body });
  }
});

// Buscar y mostrar formulario de modificación
// Buscar y mostrar formulario de modificación (usa Firestore)
app.get(['/modificar', '/modificar.html'], async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.render('modificar', { game: null, errors: [], success: null, searched: false });
    }

    // Intentar búsqueda exacta por nombre
    const productosRef = collection(db, 'productos');
    const exactQ = query(productosRef, where('nombre', '==', q));
    const exactSnap = await getDocs(exactQ);
    let producto = null;

    if (!exactSnap.empty) {
      const docFound = exactSnap.docs[0];
      producto = { id: docFound.id, ...docFound.data() };
    } else {
      // Si no hay coincidencia exacta, buscar por inclusión (traer todos y filtrar)
      const allSnap = await getDocs(productosRef);
      allSnap.forEach((d) => {
        const data = d.data();
        if (data.nombre && data.nombre.toLowerCase().includes(q.toLowerCase())) {
          if (!producto) producto = { id: d.id, ...data };
        }
      });
    }

    return res.render('modificar', {
      game: producto || null,
      errors: [],
      success: null,
      searched: true
    });
  } catch (error) {
    console.error('Error en GET /modificar:', error);
    return res.status(500).render('modificar', { game: null, errors: ['Error al buscar producto'], success: null, searched: false });
  }
});

// Procesar modificación: actualizar documento en Firestore
app.post('/modificar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    if (!id) {
      return res.status(400).render('modificar', { game: null, errors: ['ID no proporcionado'], success: null, searched: false });
    }

    // Validaciones mínimas
    const nombre = (body.nombre || body.name || '').trim();
    const descripcion = (body.descripcion || body.description || '').trim();
    const precio = (body.precio || body.price || '').toString();
    const imagen = (body.imagen || body.imageUrl || '').trim();

    const errors = [];
    if (!nombre) errors.push('El nombre es obligatorio');
    if (!descripcion) errors.push('La descripción es obligatoria');
    if (!precio) errors.push('El precio es obligatorio');
    if (!imagen) errors.push('La URL de la imagen es obligatoria');

    if (errors.length) {
      return res.status(400).render('modificar', { game: { id, ...body }, errors, success: null, searched: true });
    }

    const productoRef = doc(db, 'productos', id);
    await updateDoc(productoRef, {
      nombre,
      descripcion,
      precio,
      imagen,
      video: body.video || '',
      imagen1: body.imagen1 || '',
      imagen2: body.imagen2 || '',
      imagen3: body.imagen3 || '',
      detalles: body.detalles || '',
      min_SO: body.min_SO || '',
      min_CPU: body.min_CPU || '',
      min_RAM: body.min_RAM || '',
      min_GPU: body.min_GPU || '',
      min_ALM: body.min_ALM || '',
      rec_SO: body.rec_SO || '',
      rec_CPU: body.rec_CPU || '',
      rec_RAM: body.rec_RAM || '',
      rec_GPU: body.rec_GPU || '',
      rec_ALM: body.rec_ALM || ''
    });

    return res.render('modificar', { game: null, errors: [], success: 'Producto actualizado correctamente', searched: false });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).render('modificar', { game: null, errors: ['Error al actualizar producto'], success: null, searched: false });
  }
});
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
