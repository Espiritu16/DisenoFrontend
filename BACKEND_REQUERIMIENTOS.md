# 📦 Requerimientos del Backend para Reportar Incidencias

## Estructura de Respuestas - CRÍTICO

**Todo endpoint DEBE responder en este formato:**

```json
{
  "timestamp": "ISO-8601 datetime string",
  "success": boolean,
  "message": "Human readable message",
  "data": T,
  "path": "Request path"
}
```

### Ejemplo válido:
```json
{
  "timestamp": "2026-05-24T10:30:15.123Z",
  "success": true,
  "message": "Reporte creado exitosamente",
  "data": {
    "id": 1234,
    "tipo": "Fuga",
    "estado": "PENDIENTE"
  },
  "path": "/api/v1/reportes"
}
```

---

## Endpoint 1: Subir Imágenes

### Ruta
```
POST /api/v1/uploads/reportes
```

### Qué recibe
```
Content-Type: multipart/form-data
Body:
  - files: File[] (multiple image files)
  - Cada archivo: binary image data
```

### Qué debe enviar de vuelta
```json
{
  "timestamp": "2026-05-24T10:30:15.123Z",
  "success": true,
  "message": "Imágenes subidas correctamente",
  "data": {
    "archivos": [
      {
        "url": "https://bucket/reporte-abc123.jpg"
      },
      {
        "url": "https://bucket/reporte-def456.jpg"
      }
    ]
  },
  "path": "/api/v1/uploads/reportes"
}
```

### Status HTTP
```
✅ 200 OK (éxito)
❌ 400 Bad Request (validación falló)
❌ 401 Unauthorized (no autenticado)
❌ 413 Payload Too Large (archivos muy grandes)
❌ 500 Internal Server Error (error en backend)
```

### Implementación de Ejemplo (Spring Boot)

```java
@RestController
@RequestMapping("/api/v1/uploads")
public class UploadController {
  
  @PostMapping("/reportes")
  public ResponseEntity<ApiResponse<ArchivoSubidoResponse>> uploadReportes(
      @RequestParam("files") MultipartFile[] files,
      HttpServletRequest request
  ) {
    try {
      // Validar archivos
      if (files == null || files.length == 0) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "No files provided", null, request.getRequestURI())
        );
      }

      List<ArchivoDTO> archivos = new ArrayList<>();
      
      // Procesar cada archivo
      for (MultipartFile file : files) {
        // Validar tipo
        if (!file.getContentType().startsWith("image/")) {
          return ResponseEntity.badRequest().body(
            new ApiResponse<>(false, "Solo se permiten imágenes", null, request.getRequestURI())
          );
        }

        // Validar tamaño (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
          return ResponseEntity.badRequest().body(
            new ApiResponse<>(false, "Archivo muy grande", null, request.getRequestURI())
          );
        }

        // Guardar archivo en storage (S3, Local, etc)
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String url = guardarEnStorage(file, fileName);  // Implementar según tu storage
        
        archivos.add(new ArchivoDTO(url));
      }

      ArchivoSubidoResponse response = new ArchivoSubidoResponse();
      response.setArchivos(archivos);

      return ResponseEntity.ok(
        new ApiResponse<>(
          true,
          "Imágenes subidas correctamente",
          response,
          request.getRequestURI()
        )
      );
    } catch (Exception e) {
      return ResponseEntity.status(500).body(
        new ApiResponse<>(false, e.getMessage(), null, request.getRequestURI())
      );
    }
  }

  private String guardarEnStorage(MultipartFile file, String fileName) {
    // Implementar según tu storage:
    // - AWS S3
    // - Google Cloud Storage
    // - Azure Blob Storage
    // - Local file system
    // - Cloudinary
    // etc.
    
    // Retornar URL pública donde se puede descargar
    return "https://tu-storage.com/reporte/" + fileName;
  }
}
```

---

## Endpoint 2: Crear Reporte

### Ruta
```
POST /api/v1/reportes
Authorization: Bearer {token}
```

### Qué recibe
```json
{
  "tipo": "Fuga",
  "descripcion": "Descripción | Referencia: detalles",
  "fotoUrl": "https://bucket/reporte-abc123.jpg",
  "fotoUrls": [
    "https://bucket/reporte-abc123.jpg",
    "https://bucket/reporte-def456.jpg"
  ],
  "lat": -12.046400,
  "lng": -77.042800,
  "direccion": "Av. Universitaria 500, La Molina",
  "zona": "La Molina"
}
```

### Qué debe enviar de vuelta
```json
{
  "timestamp": "2026-05-24T10:31:00.123Z",
  "success": true,
  "message": "Reporte creado",
  "data": {
    "id": 1234,
    "usuarioId": 567,
    "tipo": "Fuga",
    "descripcion": "Descripción | Referencia: detalles",
    "fotoUrl": "https://bucket/reporte-abc123.jpg",
    "fotoUrls": [
      "https://bucket/reporte-abc123.jpg",
      "https://bucket/reporte-def456.jpg"
    ],
    "lat": -12.046400,
    "lng": -77.042800,
    "direccion": "Av. Universitaria 500, La Molina",
    "zona": "La Molina",
    "posibleDuplicado": false,
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-05-24T10:31:00.123Z",
    "fechaActualizacion": "2026-05-24T10:31:00.123Z"
  },
  "path": "/api/v1/reportes"
}
```

### Status HTTP
```
✅ 201 Created (reporte creado)
❌ 400 Bad Request (datos inválidos)
❌ 401 Unauthorized (no autenticado)
❌ 403 Forbidden (no permiso)
❌ 500 Internal Server Error
```

### Implementación de Ejemplo (Spring Boot)

```java
@RestController
@RequestMapping("/api/v1/reportes")
public class ReportesController {

  @PostMapping
  @PreAuthorize("hasAnyRole('CIUDADANO', 'OPERADOR', 'ADMIN')")
  public ResponseEntity<ApiResponse<ReporteResponse>> crear(
      @RequestBody ReporteRequest request,
      @AuthenticationPrincipal UserDetails user,
      HttpServletRequest httpRequest
  ) {
    try {
      // Obtener usuario autenticado
      Usuario usuario = usuarioService.findByEmail(user.getUsername());
      if (usuario == null) {
        return ResponseEntity.status(401).body(
          new ApiResponse<>(false, "Usuario no encontrado", null, httpRequest.getRequestURI())
        );
      }

      // Validar datos
      if (request.getTipo() == null || request.getTipo().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "Tipo es requerido", null, httpRequest.getRequestURI())
        );
      }

      if (request.getDescripcion() == null || request.getDescripcion().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "Descripción es requerida", null, httpRequest.getRequestURI())
        );
      }

      if (request.getFotoUrl() == null || request.getFotoUrl().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "FotoUrl es requerida", null, httpRequest.getRequestURI())
        );
      }

      // Crear reporte
      Reporte reporte = new Reporte();
      reporte.setUsuarioId(usuario.getId());
      reporte.setTipo(request.getTipo());
      reporte.setDescripcion(request.getDescripcion());
      reporte.setFotoUrl(request.getFotoUrl());
      reporte.setFotoUrls(request.getFotoUrls() != null ? request.getFotoUrls() : List.of(request.getFotoUrl()));
      reporte.setLat(request.getLat());
      reporte.setLng(request.getLng());
      reporte.setDireccion(request.getDireccion());
      reporte.setZona(request.getZona());
      reporte.setEstado(ReporteEstado.PENDIENTE);
      reporte.setFechaCreacion(LocalDateTime.now());
      reporte.setFechaActualizacion(LocalDateTime.now());
      reporte.setPosibleDuplicado(false);

      // Guardar en BD
      Reporte reporteGuardado = reporteRepository.save(reporte);

      // Convertir a DTO
      ReporteResponse response = reporteMapper.toResponse(reporteGuardado);

      return ResponseEntity.status(201).body(
        new ApiResponse<>(
          true,
          "Reporte creado",
          response,
          httpRequest.getRequestURI()
        )
      );
    } catch (Exception e) {
      return ResponseEntity.status(500).body(
        new ApiResponse<>(false, e.getMessage(), null, httpRequest.getRequestURI())
      );
    }
  }
}
```

---

## Clases de Apoyo Necesarias

### ApiResponse.java
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
  private String timestamp;
  private boolean success;
  private String message;
  private T data;
  private String path;

  // Constructor simplificado
  public ApiResponse(boolean success, String message, T data, String path) {
    this.timestamp = LocalDateTime.now().format(
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    );
    this.success = success;
    this.message = message;
    this.data = data;
    this.path = path;
  }
}
```

### ArchivoSubidoResponse.java
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArchivoSubidoResponse {
  private List<ArchivoDTO> archivos;
  
  // Para compatibilidad con formato alternativo
  private String url;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class ArchivoDTO {
  private String url;
}
```

### ReporteRequest.java
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteRequest {
  private String tipo;
  private String descripcion;
  private String fotoUrl;
  private List<String> fotoUrls;
  private double lat;
  private double lng;
  private String direccion;
  private String zona;
}
```

### ReporteResponse.java
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResponse {
  private long id;
  private long usuarioId;
  private String tipo;
  private String descripcion;
  private String fotoUrl;
  private List<String> fotoUrls;
  private double lat;
  private double lng;
  private String direccion;
  private String zona;
  private boolean posibleDuplicado;
  private String estado;  // "PENDIENTE", "EN_PROCESO", "RESUELTO", etc
  private String fechaCreacion;
  private String fechaActualizacion;
}
```

---

## CORS Configuration (CRÍTICO si frontend y backend en diferente puerto)

```java
@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
          .allowedOrigins("http://localhost:4200")  // Frontend URL
          .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true)
          .maxAge(3600);
      }
    };
  }
}
```

---

## Checklist para verificar que el Backend está correcto

- [ ] Endpoint `/api/v1/uploads/reportes` responde a POST
- [ ] Endpoint `/api/v1/reportes` responde a POST
- [ ] Ambos endpoints devuelven `ApiResponse<T>` con estructura correcta
- [ ] El campo `data` en respuesta NO es null
- [ ] Los campos en `ReporteResponse` tienen los tipos correctos
- [ ] Status HTTP es 200 o 201, no 500 encapsulado en JSON
- [ ] CORS está configurado para `http://localhost:4200`
- [ ] Los archivos se guardan correctamente y retornan URLs válidas
- [ ] Las URLs de las imágenes son accesibles (prueba abrir en navegador)
- [ ] La autenticación funciona (Authorization header es recibido)
- [ ] Se validan los datos antes de guardar en BD
- [ ] Los errores se devuelven con mensaje claro en `message`

---

## Prueba del Backend sin Frontend

Usa Postman, cURL o similar:

### 1. Subir imágenes
```bash
curl -X POST http://localhost:8080/api/v1/uploads/reportes \
  -F "files=@imagen1.jpg" \
  -F "files=@imagen2.jpg" \
  -H "Authorization: Bearer {tu_token}"
```

Deberías recibir:
```json
{
  "timestamp": "...",
  "success": true,
  "data": {
    "archivos": [
      { "url": "https://..." }
    ]
  },
  ...
}
```

### 2. Crear reporte
```bash
curl -X POST http://localhost:8080/api/v1/reportes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{
    "tipo": "Fuga",
    "descripcion": "Descripción del problema",
    "fotoUrl": "https://bucket/imagen.jpg",
    "fotoUrls": ["https://bucket/imagen.jpg"],
    "lat": -12.046400,
    "lng": -77.042800,
    "direccion": "Av. Universitaria 500",
    "zona": "La Molina"
  }'
```

Deberías recibir:
```json
{
  "timestamp": "...",
  "success": true,
  "data": {
    "id": 1234,
    "usuarioId": 567,
    ...
  },
  ...
}
```

---

Si tu backend sigue esta estructura exactamente, el frontend debería funcionar sin problemas. 🚀
