
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: false }));

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

// Rutas principales (mapeamos los enlaces .html usados en las vistas a rutas dinámicas)
app.get(['/', '/index.html'], (req, res) => res.render('index'));
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
