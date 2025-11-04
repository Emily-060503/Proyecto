# Instrucciones para desplegar en Render.com

## Diagnóstico de problemas

Si la página no carga en Render pero funciona en localhost, sigue estos pasos:

### 1. Verificar los logs en Render

1. Ve a tu dashboard de Render (https://dashboard.render.com)
2. Haz clic en tu servicio
3. Ve a la pestaña **"Logs"**
4. Busca mensajes de error como:
   - `Error al renderizar inicio:`
   - `Cannot find module`
   - Errores de Firebase

### 2. Probar el endpoint de diagnóstico

Abre en tu navegador: `https://tu-app.onrender.com/health`

Deberías ver algo como:
```json
{
  "status": "OK",
  "timestamp": "2025-11-04T...",
  "env": "production",
  "views": "/opt/render/project/src/views",
  "firebase": "proyecto-ef176"
}
```

Si no ves esto, el servidor no está iniciando correctamente.

### 3. Verificar la configuración en Render

En tu servicio de Render, verifica:

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Environment Variables:**
- No son necesarias si usas las credenciales directamente en el código (como ahora)
- Si prefieres usar variables de entorno (más seguro):
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`

### 4. Problemas comunes y soluciones

#### A. Error "Cannot GET /"
**Causa:** El servidor no está iniciando correctamente.
**Solución:** Revisa los logs de Render para ver el error específico.

#### B. Página en blanco o sin estilos
**Causa:** Los archivos estáticos no se están sirviendo.
**Solución:** 
- Asegúrate de que las carpetas `public`, `views`, `img`, `media` estén en el repositorio
- Verifica que no estén en `.gitignore`

#### C. Error de Firebase
**Causa:** Las credenciales de Firebase no están configuradas.
**Solución:** Verifica que las credenciales en `index.js` sean correctas.

#### D. Error "Module not found"
**Causa:** Las dependencias no se instalaron correctamente.
**Solución:** 
- Ve a Render → Manual Deploy → Clear build cache & deploy
- Asegúrate de que `package.json` tiene todas las dependencias:
  ```json
  "dependencies": {
    "ejs": "^3.1.10",
    "express": "^5.1.0",
    "firebase": "^12.5.0"
  }
  ```

### 5. Forzar redespliegue

1. Ve a Render dashboard
2. Haz clic en tu servicio
3. Haz clic en **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Espera a que termine el deploy
5. Revisa los logs durante el proceso

### 6. Verificar archivos necesarios

Asegúrate de que estos archivos/carpetas estén en tu repositorio:
```
├── index.js
├── package.json
├── views/
│   ├── inicio.ejs
│   ├── index.ejs
│   ├── registrar.ejs
│   ├── styles.css
│   └── ...
├── public/
│   └── styles.css
├── img/
└── media/
```

### 7. Probar localmente en modo producción

Antes de desplegar, prueba en modo producción local:

```bash
# Windows PowerShell
$env:NODE_ENV="production"
node index.js

# CMD
set NODE_ENV=production
node index.js
```

Luego abre `http://localhost:3000` y verifica que todo funcione.

### 8. Contactar soporte

Si ninguna de estas soluciones funciona:
1. Revisa los logs completos en Render
2. Copia el mensaje de error exacto
3. Comparte el error para obtener ayuda específica

## Comandos útiles para debug

### Ver logs en tiempo real
En Render dashboard → Logs → Activa "Auto-scroll"

### Verificar que el servidor está escuchando
En los logs deberías ver:
```
Servidor arrancado en http://localhost:3000 (ENV PORT=none)
```

### Verificar peticiones
Los logs mostrarán cada petición:
```
GET /
GET /styles.css
GET /img/banner.jpg
```

Si no ves estas peticiones, el problema está en el navegador/DNS.
