# Diagnóstico - Problema de Envío de Reportes

## 🔴 Problema Reportado
- Botón "Enviar reporte" se queda cargando infinitamente
- No aparece mensaje de éxito "Reporte REP-XXX registrado"
- No hay mensajes de error claros

---

## 📋 Flujo Que Espera El Frontend

### PASO 1: Validaciones Locales
```
✓ Usuario debe estar logueado (isLoggedIn)
✓ Descripción no vacía
✓ Dirección no vacía  
✓ Al menos 1 imagen seleccionada
```

### PASO 2: Subir Imágenes
**Endpoint:** `POST /api/v1/uploads/reportes`
**Qué envía:**
```
FormData {
  files: File[] (array of image files)
}
```

**Qué espera recibir (CRÍTICO):**
```json
{
  "timestamp": "2026-05-24T10:30:00Z",
  "success": true,
  "message": "Imágenes subidas correctamente",
  "data": {
    "archivos": [
      { "url": "https://bucket/reporte-123.jpg" },
      { "url": "https://bucket/reporte-124.jpg" }
    ]
  },
  "path": "/api/v1/uploads/reportes"
}
```

**O alternativa:**
```json
{
  "timestamp": "2026-05-24T10:30:00Z",
  "success": true,
  "message": "Imagen subida",
  "data": {
    "url": "https://bucket/reporte-123.jpg"
  },
  "path": "/api/v1/uploads/reportes"
}
```

### PASO 3: Crear Reporte
**Endpoint:** `POST /api/v1/reportes`
**Qué envía:**
```json
{
  "tipo": "Fuga",
  "descripcion": "Descripción del problema | Referencia: Detalles adicionales",
  "fotoUrl": "https://bucket/reporte-123.jpg",
  "fotoUrls": [
    "https://bucket/reporte-123.jpg",
    "https://bucket/reporte-124.jpg"
  ],
  "lat": -12.046400,
  "lng": -77.042800,
  "direccion": "Av. Universitaria 500, La Molina",
  "zona": "La Molina"
}
```

**Qué espera recibir (CRÍTICO):**
```json
{
  "timestamp": "2026-05-24T10:30:00Z",
  "success": true,
  "message": "Reporte creado",
  "data": {
    "id": 1234,
    "usuarioId": 567,
    "tipo": "Fuga",
    "descripcion": "...",
    "fotoUrl": "https://bucket/reporte-123.jpg",
    "fotoUrls": ["https://bucket/reporte-123.jpg"],
    "lat": -12.046400,
    "lng": -77.042800,
    "direccion": "Av. Universitaria 500, La Molina",
    "zona": "La Molina",
    "posibleDuplicado": false,
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-05-24T10:30:00Z",
    "fechaActualizacion": "2026-05-24T10:30:00Z"
  },
  "path": "/api/v1/reportes"
}
```

### PASO 4: Mostrar Éxito
Si todo va bien, muestra:
```
"Reporte REP-1234 registrado para La Molina."
```

---

## 🔍 Posibles Problemas y Soluciones

### PROBLEMA 1: Backend no existe o no responde
**Síntomas:**
- Botón cargando indefinidamente
- Timeout después de 120 segundos (sin mensaje)
- Console del navegador: GET `http://localhost:4200/api/v1/uploads/reportes` → Error de red

**Solución:**
1. Verifica que el backend está corriendo
2. Verifica que está en `http://localhost:[PUERTO]`
3. Si está en diferente puerto, actualiza `environment.ts`:
```typescript
export const environment = {
  apiBaseUrl: 'http://localhost:3000/api/v1'  // o el puerto correcto
};
```

---

### PROBLEMA 2: Backend no devuelve formato correcto
**Síntomas:**
- Status 200 pero frontend no muestra éxito
- Mensaje error pero vago: "apiErrorMessage(error)"

**Qué revisar en backend:**
El backend DEBE responder EXACTAMENTE en este formato para ambos endpoints:

```typescript
// En Java/Spring:
@PostMapping("/uploads/reportes")
public ResponseEntity<ApiResponse<ArchivoSubidoResponse>> uploadReportes(
  @RequestParam("files") MultipartFile[] files
) {
  // ... guardar archivos ...
  return ResponseEntity.ok(new ApiResponse<>(
    true,
    "Imágenes subidas correctamente",
    new ArchivoSubidoResponse(urlsList),
    request.getRequestURI()
  ));
}

@PostMapping
public ResponseEntity<ApiResponse<ReporteResponse>> crearReporte(
  @RequestBody ReporteRequest request,
  @AuthenticationPrincipal UserDetails user
) {
  // ... crear reporte ...
  return ResponseEntity.status(201).body(new ApiResponse<>(
    true,
    "Reporte creado",
    nuevoReporte,
    request.getRequestURI()
  ));
}
```

---

### PROBLEMA 3: CORS bloqueando las solicitudes
**Síntomas:**
- Console: "Access to XMLHttpRequest blocked by CORS policy"
- Network tab: Estado 0 o cancelada

**Solución en backend (Spring Boot):**
```java
@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
          .allowedOrigins("http://localhost:4200")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
          .allowedHeaders("*")
          .allowCredentials(true);
      }
    };
  }
}
```

---

### PROBLEMA 4: Token de autenticación no está siendo enviado
**Síntomas:**
- Backend rechaza con 401 Unauthorized
- El usuario está logueado en frontend pero backend no lo reconoce

**Qué verifica:**
1. El localStorage/sessionStorage tiene el token? 
   - Abre DevTools → Application → Storage
   - Busca `auth`, `token`, o similar
   
2. El HttpClient está enviando el Authorization header?
   - En Network tab, ve la solicitud y revisa Headers
   - Debe tener: `Authorization: Bearer {token}`

**Solución en frontend (si no está configurado):**
```typescript
// Verifica en el auth.service.ts que tenga un interceptor
// que agregue el token a cada solicitud:

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.token;
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

---

## 🛠️ Cómo Diagnosticar Exactamente

### Paso 1: Abre DevTools (F12)
### Paso 2: Ve a Network tab
### Paso 3: Rellena el formulario y haz click en "Enviar reporte"
### Paso 4: Busca las solicitudes:
- `POST /api/v1/uploads/reportes` - Primera solicitud
- `POST /api/v1/reportes` - Segunda solicitud (si upload tuvo éxito)

### Paso 5: Revisa cada solicitud:

**Para cada una, verifica:**
- ✅ Status: Debe ser 200 o 201
- ✅ Response: Debe tener estructura `{ timestamp, success, message, data, path }`
- ✅ Headers: Debe tener `Authorization: Bearer {token}`

**Si ves error:**
- 400 → Datos malformados (revisa qué envía frontend)
- 401 → Token inválido o no enviado
- 403 → Usuario no autorizado
- 404 → Endpoint no existe
- 500 → Error en backend
- 0/cancel → Problema de red/CORS

---

## 📝 Cambios Recomendados en Frontend

Para mejorar los mensajes de error, he preparado una actualización al componente:

### 1. Mejorar feedback visual
```typescript
// En reportar-incidencia.component.ts submit():
this.message = 'Subiendo evidencia...' // Mostrar mientras sube
// Luego: 'Guardando reporte...'
// Luego: 'Reporte REP-1234 registrado'
```

### 2. Debuggear mejor los errores
Agregué logging en la consola para ver exactamente qué responde el backend.

---

## 📋 Checklist para el Backend

- [ ] Endpoint POST `/api/v1/uploads/reportes` existe
- [ ] Endpoint POST `/api/v1/reportes` existe
- [ ] Ambos responden en formato JSON con `ApiResponse<T>`
- [ ] CORS está configurado para `http://localhost:4200`
- [ ] Backend autentica correctamente (Authorization header)
- [ ] Las URLs de imágenes subidas están correctas y accesibles
- [ ] El campo `data` en la respuesta no es null/undefined
- [ ] Status HTTP es 200 o 201, nunca encapsulado en JSON

---

## 🎯 Conclusión

**99% del problema es:** El backend no está devolviendo exactamente el formato que espera el frontend.

Verifica:
1. Abre DevTools → Network
2. Intenta enviar reporte
3. Mira qué responde el backend
4. Comparalo con la estructura esperada arriba
5. Ajusta el backend para que coincida exactamente

Si aún así no funciona, **comparte aquí la respuesta del backend** y debuggearemos juntos.
