# 🔧 Cómo Depurar El Problema de Envío de Reportes

## Paso 1: Abre DevTools
```
Windows/Linux: F12 o Ctrl+Shift+I
Mac: Cmd+Option+I
```

## Paso 2: Ve a la sección Console
- Haz click en la pestaña "Console" en DevTools
- Aquí verás los logs del frontend

## Paso 3: Rellena el formulario
- Selecciona un distrito
- Selecciona un tipo de reporte
- Escribe una descripción
- Espera a que la dirección se autocomplete (o escribela manualmente)
- Haz click en el mapa para seleccionar ubicación
- Sube al menos 1 imagen

## Paso 4: Haz click en "Enviar reporte"

## Paso 5: Observa la Console
Deberías ver logs como:

```
📤 Iniciando envío de reporte
Imágenes: 1
✅ Imágenes subidas: { archivos: [...] }
📝 Enviando reporte con payload: { tipo: "Fuga", ... }
✅ Reporte creado exitosamente: { id: 1234, ... }
```

**O si hay error:**
```
📤 Iniciando envío de reporte
Imágenes: 1
❌ Error en envío de reporte: [Error object]
Mensaje de error: ...
```

---

## Paso 6: Ve a la pestaña Network

1. Click en la pestaña "Network"
2. Marca la opción "Preserve log" (para que no desaparezcan)
3. Recarga la página (F5)
4. Rellena el formulario nuevamente
5. Haz click en "Enviar reporte"

Deberías ver 2 solicitudes POST:

### Primera solicitud:
```
POST /api/v1/uploads/reportes
Status: 200 ✓ (verde)
```

### Segunda solicitud:
```
POST /api/v1/reportes
Status: 201 ✓ (verde)
```

---

## Paso 7: Revisa cada solicitud

### Para la primera solicitud (/uploads/reportes):

**Click en ella → Tab "Response"**

Deberías ver:
```json
{
  "timestamp": "2026-05-24T10:30:00Z",
  "success": true,
  "message": "Imágenes subidas",
  "data": {
    "archivos": [
      { "url": "https://bucket/imagen.jpg" }
    ]
  },
  "path": "/api/v1/uploads/reportes"
}
```

**O si falla:**
- Status rojo (error)
- Response mostrará el error del backend

### Para la segunda solicitud (/reportes):

**Click en ella → Tab "Response"**

Deberías ver:
```json
{
  "timestamp": "2026-05-24T10:31:00Z",
  "success": true,
  "message": "Reporte creado",
  "data": {
    "id": 1234,
    "usuarioId": 567,
    "tipo": "Fuga",
    "descripcion": "...",
    "fotoUrl": "https://bucket/imagen.jpg",
    "fotoUrls": ["https://bucket/imagen.jpg"],
    "lat": -12.046400,
    "lng": -77.042800,
    "direccion": "Av. Universitaria 500",
    "zona": "La Molina",
    "posibleDuplicado": false,
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-05-24T10:31:00Z",
    "fechaActualizacion": "2026-05-24T10:31:00Z"
  },
  "path": "/api/v1/reportes"
}
```

---

## 🚨 Escenarios de Error Comunes

### Escenario 1: No aparece NINGUNA solicitud en Network
**Problema:** El botón no está disparando nada
**Soluciones:**
- [ ] ¿Estás logueado? (Mira en la esquina superior derecha)
- [ ] ¿El formulario está completo? Revisa en Console si dice qué falta
- [ ] Recarga la página e intenta de nuevo

---

### Escenario 2: Primera solicitud da Status 404
```
POST /api/v1/uploads/reportes ... 404 Not Found
```

**Problema:** El endpoint no existe en el backend

**Soluciones en Backend:**
- [ ] ¿Existe la ruta POST `/api/v1/uploads/reportes`?
- [ ] ¿El controlador tiene la anotación `@PostMapping("/reportes")`?
- [ ] ¿Estás usando Spring Boot u otro framework?

**Ejemplo correcto (Spring Boot):**
```java
@RestController
@RequestMapping("/api/v1/uploads")
public class UploadController {
  
  @PostMapping("/reportes")
  public ResponseEntity<ApiResponse<ArchivoSubidoResponse>> uploadReportes(
    @RequestParam("files") MultipartFile[] files
  ) {
    // ... tu lógica de guardado ...
    List<ArchivoDTO> archivos = new ArrayList<>();
    for (MultipartFile file : files) {
      String url = guardarArchivo(file);
      archivos.add(new ArchivoDTO(url));
    }
    return ResponseEntity.ok(new ApiResponse<>(
      true,
      "Imágenes subidas correctamente",
      new ArchivoSubidoResponse(archivos),
      request.getRequestURI()
    ));
  }
}
```

---

### Escenario 3: Primera solicitud da Status 401
```
POST /api/v1/uploads/reportes ... 401 Unauthorized
```

**Problema:** El token no está siendo enviado o es inválido

**Soluciones:**
1. Verifica que estés logueado
2. En Network, haz click en la solicitud → Tab "Headers" → busca "Authorization"
3. Deberías ver: `Authorization: Bearer eyJhbGc...`

Si no ves el header:
- El backend necesita un interceptor que agregue el token

---

### Escenario 4: Primera solicitud Status 200, pero Response diferente
```
Response:
{
  "url": "https://bucket/imagen.jpg"  // ← Incorrecto
}
```

**Problema:** El formato de respuesta no es el esperado

**Lo que espera frontend:**
```json
{
  "timestamp": "...",
  "success": true,
  "message": "...",
  "data": {
    "archivos": [
      { "url": "..." }
    ]
  },
  "path": "..."
}
```

**Solución en Backend:**
Asegúrate que TODOS los endpoints devuelvan un `ApiResponse<T>`:

```java
// ❌ INCORRECTO
@PostMapping
public ArchivoDTO upload(MultipartFile file) {
  return new ArchivoDTO(url);  // El frontend no puede deserializar esto
}

// ✅ CORRECTO
@PostMapping
public ResponseEntity<ApiResponse<ArchivoDTO>> upload(MultipartFile file) {
  return ResponseEntity.ok(new ApiResponse<>(
    true,
    "Archivo guardado",
    new ArchivoDTO(url),
    request.getRequestURI()
  ));
}
```

---

### Escenario 5: Timeout (sin respuesta en 120 segundos)
```
Console: ⏱️ La solicitud tardó demasiado (>120s)
Network: Solicitud pendiente y luego cancelada
```

**Problema:** El backend no está respondiendo en absoluto

**Soluciones:**
1. [ ] ¿El servidor backend está corriendo?
   ```bash
   # Si es Spring Boot, debería ver:
   # Started Application in 5.234 seconds
   ```

2. [ ] ¿En qué puerto está?
   - Por defecto: `http://localhost:8080`
   - O especificado en `application.properties`:
   ```properties
   server.port=8080
   ```

3. [ ] ¿El frontend tiene la URL correcta?
   - Abre: `/src/environments/environment.ts`
   - Verifica `apiBaseUrl`
   - Si backend está en puerto 8080:
   ```typescript
   apiBaseUrl: 'http://localhost:8080/api/v1'
   ```

4. [ ] [ ] ¿Hay CORS bloqueando?
   - Console podría mostrar:
   ```
   Access to XMLHttpRequest at 'http://localhost:8080/api/v1/uploads/reportes'
   from origin 'http://localhost:4200' has been blocked by CORS policy
   ```
   - Solución: Configura CORS en backend (ver DIAGNOSTICO_ENVIO_REPORTES.md)

---

## 📸 Qué Compartir Si Necesitas Ayuda

Si el problema persiste, comparte:

1. **Screenshot del error en Console**
   - Presiona F12 → Console
   - Haz click derecho → "Save as..."

2. **Response de la solicitud fallida**
   - Network tab → Click en la solicitud roja
   - Tab "Response"
   - Screenshot o copia el JSON

3. **Logs del backend**
   - La consola de tu aplicación Spring/Node/etc
   - Busca líneas rojas de error

4. **Tu endpoint en el backend**
   - El código Java/Node/etc del controlador
   - Para que verifiquemos que devuelva el formato correcto

---

## 🎯 Resumen Rápido

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| No aparece solicitud en Network | Botón no está funcionando | Verifica que estés logueado, formulario completo |
| Status 404 | Endpoint no existe | Crea el endpoint en el backend |
| Status 401 | Token no enviado/inválido | Configura interceptor de autenticación |
| Status 500 | Error en backend | Revisa logs del backend |
| Response incorrecta | Formato JSON mal | Devuelve `ApiResponse<T>` desde todos los endpoints |
| Timeout | Backend no responde | Verifica que backend está corriendo en puerto correcto |
| CORS error | Frontend y backend en diferente puerto | Configura CORS en backend |

---

**Si después de estos pasos sigue sin funcionar, tenemos toda la información que necesitamos para debuggear juntos.** 🚀
