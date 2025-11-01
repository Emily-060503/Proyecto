
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Páginas de cada juego (las vistas existen en views/)
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
