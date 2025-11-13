# 🚀 Guía Rápida de Despliegue en Render

## ✅ Paso 1: Tu código ya está en GitHub
El código ha sido pusheado exitosamente a:
- Repositorio: Emily-060503/Proyecto
- Rama: Main

## 📝 Paso 2: Variables de Entorno que Necesitas

Copia estos valores (están en tu archivo `.env` local):

```
FIREBASE_API_KEY=AIzaSyAgja9DNXFZ1GFqXQW6gfdmQc332swF-7g
FIREBASE_AUTH_DOMAIN=proyecto-ef176.firebaseapp.com
FIREBASE_PROJECT_ID=proyecto-ef176
FIREBASE_STORAGE_BUCKET=proyecto-ef176.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=953870791085
FIREBASE_APP_ID=1:953870791085:web:4a414c3b57eacf98b77124
FIREBASE_MEASUREMENT_ID=G-LNJHBLN7ZK
SESSION_SECRET=una_cadena_larga_y_secreta
NODE_ENV=production
```

## 🌐 Paso 3: Crear Web Service en Render

### 3.1 Ir a Render
1. Abre tu navegador
2. Ve a: https://dashboard.render.com/
3. Inicia sesión (o crea cuenta si no tienes)

### 3.2 Nuevo Web Service
1. Click en botón **"New +"** (esquina superior derecha)
2. Selecciona **"Web Service"**

### 3.3 Conectar GitHub
1. Autoriza a Render para acceder a tu GitHub
2. Busca el repositorio: **"Proyecto"** o **"Emily-060503/Proyecto"**
3. Click en **"Connect"**

### 3.4 Configurar el Servicio

Completa el formulario con estos valores:

```
Name: basegamer
(o el nombre que prefieras - será parte de la URL)

Region: Oregon (US West)
(o el más cercano a tu ubicación)

Branch: Main
(debe coincidir con tu rama principal)

Runtime: Node
(Render lo detecta automáticamente)

Build Command: npm install
(Render lo detecta automáticamente)

Start Command: npm start
(Render lo detecta automáticamente)

Instance Type: Free
(suficiente para empezar)
```

### 3.5 Variables de Entorno (IMPORTANTE)

En la sección **"Environment Variables"**:

1. Click en **"Add Environment Variable"**
2. Añade CADA una de estas variables:

| Key | Value |
|-----|-------|
| `FIREBASE_API_KEY` | `AIzaSyAgja9DNXFZ1GFqXQW6gfdmQc332swF-7g` |
| `FIREBASE_AUTH_DOMAIN` | `proyecto-ef176.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `proyecto-ef176` |
| `FIREBASE_STORAGE_BUCKET` | `proyecto-ef176.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `953870791085` |
| `FIREBASE_APP_ID` | `1:953870791085:web:4a414c3b57eacf98b77124` |
| `FIREBASE_MEASUREMENT_ID` | `G-LNJHBLN7ZK` |
| `SESSION_SECRET` | `una_cadena_larga_y_secreta` |
| `NODE_ENV` | `production` |

**💡 Tip:** Copia y pega desde tu archivo `.env` local para evitar errores

### 3.6 Crear el Servicio
1. Revisa que todo esté correcto
2. Click en **"Create Web Service"** (botón azul al final)

## ⏱️ Paso 4: Esperar el Despliegue

Render comenzará a:
1. ✅ Clonar tu repositorio
2. ✅ Instalar dependencias (`npm install`)
3. ✅ Iniciar el servidor (`npm start`)

**Tiempo estimado:** 2-5 minutos

Verás logs en tiempo real:
```
==> Cloning from https://github.com/Emily-060503/Proyecto...
==> Running 'npm install'
==> Starting service with 'npm start'
==> Your service is live 🎉
```

## 🎉 Paso 5: ¡Tu App Está Viva!

### URL de tu aplicación:
```
https://basegamer.onrender.com
```
(o el nombre que hayas elegido)

### Probar las rutas:
- **Login:** https://basegamer.onrender.com/
- **Home:** https://basegamer.onrender.com/home
- **Catálogo:** https://basegamer.onrender.com/catalogo
- **Agregar:** https://basegamer.onrender.com/agregar
- **Modificar:** https://basegamer.onrender.com/modificar

## 🔄 Actualizar la App (después del primer deploy)

Cada vez que hagas cambios:

```bash
# 1. Hacer cambios en tu código
# 2. Commit
git add .
git commit -m "Descripción de los cambios"

# 3. Push a GitHub
git push origin Main

# 4. Render redesplegar automáticamente en 2-3 minutos
```

## ⚠️ Solución de Problemas Comunes

### Error: "Deploy failed"
**Solución:** Revisa los logs en Render. Causas comunes:
- Variable de entorno mal escrita
- Puerto incorrecto
- Dependencia faltante

### Error 500 en la app
**Solución:**
- Verifica las variables de entorno en Render
- Asegúrate que Firestore tenga datos
- Revisa las reglas de Firestore

### La app tarda en cargar (primera visita)
**Normal en plan Free:** La app se "duerme" después de 15 min de inactividad.
Primera carga puede tomar 30-60 segundos.

### No puedo ver mis imágenes
**Solución:** Usa URLs absolutas para imágenes o súbelas a un servicio CDN.

## 📊 Monitoreo

En el dashboard de Render puedes ver:
- 📈 Métricas (CPU, memoria, requests)
- 📝 Logs en tiempo real
- 🔄 Historial de deploys
- ⚙️ Configuración

## 🎓 Recursos Adicionales

- 📖 [Documentación completa](./DEPLOY.md)
- 🌐 [Docs de Render](https://render.com/docs)
- 🔥 [Firebase Console](https://console.firebase.google.com)

---

## ✅ Checklist Final

Antes de marcar como completo:

- [ ] Cuenta en Render creada
- [ ] Repositorio conectado
 - [ ] Todas las variables de entorno configuradas (Firebase + SESSION_SECRET)
- [ ] Deploy exitoso (estado "Live")
- [ ] URL funciona en el navegador
- [ ] Login funciona
- [ ] Catálogo muestra productos
- [ ] Búsqueda funciona

---

**¿Necesitas ayuda?** 
Revisa los logs en Render o consulta [DEPLOY.md](./DEPLOY.md) para más detalles.

🎉 **¡Felicidades por tu primer despliegue!** 🎉
