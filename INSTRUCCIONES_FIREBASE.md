# Instrucciones para configurar Firebase

## Paso 1: Obtener las credenciales de Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a "Configuración del proyecto" (ícono de engranaje)
4. En la sección "Tus apps", selecciona la app web (o crea una nueva)
5. Copia las credenciales del objeto `firebaseConfig`

## Paso 2: Configurar las credenciales en el proyecto

Abre el archivo `index.js` y reemplaza las siguientes líneas con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

## Paso 3: Configurar Firestore

1. En la consola de Firebase, ve a "Firestore Database"
2. Crea una colección llamada `usuarios`
3. Agrega documentos con los campos:
   - `usuario` (string): nombre de usuario
   - `contrasena` (string): contraseña (en producción, usa hash)

## Paso 4: Configurar reglas de seguridad

En Firestore, ve a "Reglas" y configura las reglas de lectura:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{document=**} {
      allow read: if true; // Para desarrollo - en producción usa autenticación
      allow write: if false;
    }
  }
}
```

## Paso 5: Ejecutar el servidor

```bash
npm start
```

Ahora puedes acceder a http://localhost:3000 y verás el formulario de login.
