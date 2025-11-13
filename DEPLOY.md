# Guía de Despliegue en Render

## 📋 Pre-requisitos

1. Cuenta en [Render.com](https://render.com) (gratis)
2. Repositorio en GitHub con tu código
3. Credenciales de Firebase a mano

---

## 🚀 Pasos para desplegar

### 1. Preparar el repositorio

**Verificar que estos archivos estén commitados:**
```bash
git status
git add .
git commit -m "Preparar para despliegue en Render"
git push origin main
```

**Asegúrate de que `.env` NO esté en Git:**
- El archivo `.gitignore` ya está configurado para excluir `.env`
- Solo se debe subir `.env.example` (sin credenciales reales)

---

### 2. Crear Web Service en Render

1. **Ir a [Render Dashboard](https://dashboard.render.com/)**

2. **Clic en "New +" → "Web Service"**

3. **Conectar repositorio de GitHub:**
   - Autoriza a Render para acceder a tu GitHub
   - Busca el repositorio "Proyecto"
   - Clic en "Connect"

4. **Configurar el servicio:**
   ```
   Name: tiendagamer (o el nombre que prefieras)
   Region: Oregon (US West) o el más cercano
   Branch: Main
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

---

### 3. Configurar Variables de Entorno

En la sección **"Environment Variables"**, añade TODAS estas variables con sus valores reales:

**⚠️ IMPORTANTE: Copia los valores de tu archivo `.env` local**

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

**Cómo añadir cada variable:**
1. Clic en "Add Environment Variable"
2. Key: `FIREBASE_API_KEY`
3. Value: (pega el valor real)
4. Repite para cada variable

---

### 4. Desplegar

1. **Clic en "Create Web Service"**
2. Render comenzará a:
   - Clonar tu repositorio
   - Ejecutar `npm install`
   - Ejecutar `npm start`
3. Espera 2-5 minutos
4. Verás el estado cambiar a "Live" 🎉

---

### 5. Verificar el despliegue

**Tu aplicación estará disponible en:**
```
https://tiendagamer.onrender.com
```
(o el nombre que hayas elegido)

**Prueba las rutas principales:**
- `/` - Login
- `/home` - Página principal con productos
- `/catalogo` - Catálogo completo
- `/agregar` - Agregar producto
- `/modificar` - Modificar producto

---

## 🔧 Configuración Avanzada (Opcional)

### Auto-Deploy desde GitHub

Render detectará automáticamente los cambios en tu rama `main` y redesplegar.

Para actualizar tu app:
```bash
git add .
git commit -m "Actualización"
git push origin main
```
Render redesplegar automáticamente en 2-3 minutos.

---

### Dominios Personalizados

1. En el dashboard de Render, ve a "Settings"
2. Sección "Custom Domain"
3. Añade tu dominio (ej: `www.basegamer.com`)
4. Configura los DNS según las instrucciones de Render

---

## 🐛 Solución de Problemas

### Error: "Application failed to start"

**Revisar logs:**
1. En Render dashboard, clic en "Logs"
2. Busca errores en rojo

**Causas comunes:**
- Variables de entorno faltantes o incorrectas
   - Recuerda incluir SESSION_SECRET para sesiones persistentes
- Puerto incorrecto (debe usar `process.env.PORT`)
- Dependencias faltantes en `package.json`

### Error 500 - Internal Server Error

**Verificar:**
- Las credenciales de Firebase son correctas
- La base de datos Firestore tiene las colecciones: `usuarios` y `productos`
- Las reglas de Firestore permiten lectura/escritura

### La app se duerme (Free tier)

En el plan gratuito, Render "duerme" tu app después de 15 minutos de inactividad:
- Primera visita después de dormir: tarda 30-60 segundos en despertar
- Solución: Upgrade a plan pago ($7/mes) para mantenerla siempre activa

---

## 📊 Monitoreo

**Métricas disponibles en Render:**
- CPU usage
- Memory usage
- Request count
- Response times

**Logs en tiempo real:**
```bash
# Ver logs desde terminal (requiere Render CLI)
render logs -s tiendagamer
```

---

## 🔐 Seguridad Post-Despliegue

1. **Verificar que `.env` no esté en GitHub:**
   ```bash
   git ls-files | grep .env
   # No debe mostrar .env, solo .env.example
   ```

2. **Revisar reglas de Firestore:**
   - No permitir acceso público sin autenticación
   - Validar permisos de lectura/escritura

3. **Habilitar HTTPS:**
   - Render lo hace automáticamente ✅

---

## 📞 Soporte

**Documentación oficial de Render:**
- [Node.js en Render](https://render.com/docs/deploy-node-express-app)
- [Variables de entorno](https://render.com/docs/environment-variables)
- [Troubleshooting](https://render.com/docs/troubleshooting)

**Si tienes problemas:**
1. Revisa los logs en Render dashboard
2. Verifica las variables de entorno
3. Prueba localmente con `NODE_ENV=production npm start`

---

## ✅ Checklist Final

Antes de desplegar, verifica:

- [ ] Código pusheado a GitHub (main branch)
- [ ] `.env` NO está en Git
- [ ] `package.json` tiene todas las dependencias
- [ ] Variables de entorno listas para copiar
- [ ] Firestore tiene datos de prueba
- [ ] Reglas de Firestore configuradas
- [ ] Cuenta de Render creada

¡Listo para desplegar! 🚀
