# BaseGamer 🎮

Base de datos de videojuegos con gestión completa de productos (CRUD), búsqueda en tiempo real y autenticación de usuarios.

## 🚀 Características

- ✅ Sistema de login y registro de usuarios
- ✅ Catálogo de productos con Firebase Firestore
- ✅ Búsqueda en tiempo real con sugerencias
- ✅ Agregar, modificar y ver detalles de productos
- ✅ Diseño responsive con CSS moderno
- ✅ Desplegable en Render con un clic

## 🛠️ Tecnologías

- **Backend:** Node.js + Express
- **Base de datos:** Firebase Firestore
- **Template Engine:** EJS
- **Despliegue:** Render
- **Variables de entorno:** dotenv

## 📦 Instalación Local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Emily-060503/Proyecto.git
cd Proyecto
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env y añadir tus credenciales de Firebase
```

4. **Iniciar el servidor:**
```bash
npm start
```

5. **Abrir en el navegador:**
```
http://localhost:3000
```

## 🔧 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_STORAGE_BUCKET=tu_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id
FIREBASE_MEASUREMENT_ID=tu_measurement_id
PORT=3000
NODE_ENV=development
```

## 🌐 Despliegue en Render

Lee la guía completa en [DEPLOY.md](./DEPLOY.md)

**Pasos rápidos:**
1. Push del código a GitHub
2. Crear Web Service en Render
3. Conectar el repositorio
4. Configurar variables de entorno
5. Deploy automático ✨

## 📁 Estructura del Proyecto

```
Proyecto/
├── views/           # Plantillas EJS
│   ├── index.ejs    # Página principal
│   ├── catalogo.ejs # Catálogo de productos
│   ├── agregar.ejs  # Agregar producto
│   ├── modificar.ejs# Modificar producto
│   └── detalles.ejs # Detalles del producto
├── public/          # Archivos estáticos
│   └── styles.css   # Estilos CSS
├── img/             # Imágenes
├── index.js         # Servidor Express
├── package.json     # Dependencias
├── render.yaml      # Configuración de Render
└── .env.example     # Ejemplo de variables de entorno
```

## 🔐 Seguridad

- ✅ Credenciales en variables de entorno (no en código)
- ✅ Archivo `.env` excluido de Git
- ✅ HTTPS automático en Render
- ✅ Validación de datos en servidor

## 📝 Uso

### Login
1. Accede a `/` o `/inicio`
2. Ingresa usuario y contraseña
3. Serás redirigido a `/home`

### Ver Productos
- **Inicio:** Muestra los 4 productos más baratos
- **Catálogo:** Muestra todos los productos

### Buscar
- Escribe en el buscador del header
- Ver sugerencias en tiempo real
- Filtrar por nombre o descripción

### Agregar Producto
1. Ve a `/agregar`
2. Completa el formulario
3. El producto se guarda en Firestore

### Modificar Producto
1. Ve a `/modificar`
2. Busca el producto por nombre
3. Edita los campos
4. Guarda los cambios

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👥 Autor

Emily-060503

## 🐛 Reportar Problemas

Si encuentras algún bug o tienes sugerencias, por favor abre un [issue](https://github.com/Emily-060503/Proyecto/issues).

---

⭐ Si te gusta el proyecto, dale una estrella en GitHub!
