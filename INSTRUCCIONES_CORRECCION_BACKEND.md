# 🔧 INSTRUCCIONES DE CORRECCIÓN PARA EL BACKEND

## ❌ PROBLEMAS ENCONTRADOS

### Problema 1: El upload devuelve `nombreArchivo` en lugar de `url`

**Lo que está devolviendo ahora:**
```json
{
  "data": {
    "archivos": [
      {
        "nombreArchivo": "Captura de pantalla 2026-05-05..."
      }
    ]
  }
}
```

**Lo que debe devolver:**
```json
{
  "data": {
    "archivos": [
      {
        "url": "https://bucket.com/reporte-abc123.jpg"
      }
    ]
  }
}
```

---

### Problema 2: El reporte devuelve campos en inglés

**Lo que está devolviendo ahora:**
```json
{
  "data": {
    "description": "asasd",
    "direction": "Calle Doctor...",
    ...
  }
}
```

**Lo que debe devolver:**
```json
{
  "data": {
    "descripcion": "asasd",
    "direccion": "Calle Doctor...",
    "tipo": "Fuga",
    "zona": "La Molina",
    "estado": "PENDIENTE",
    "id": 1234,
    "usuarioId": 567,
    "fotoUrl": "https://...",
    "fotoUrls": ["https://..."],
    "lat": -12.046400,
    "lng": -77.042800,
    "posibleDuplicado": false,
    "fechaCreacion": "2026-05-24T10:30:00Z",
    "fechaActualizacion": "2026-05-24T10:30:00Z"
  }
}
```

---

## ✅ SOLUCIONES

### CORRECCIÓN 1: Clase ArchivoDTO

**❌ INCORRECTO (Lo que tienes ahora):**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoDTO {
  private String nombreArchivo;  // ❌ MALO
}
```

**✅ CORRECTO (Lo que debes tener):**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoDTO {
  private String url;  // ✅ CORRECTO
}
```

---

### CORRECCIÓN 2: Clase ArchivoSubidoResponse

**❌ INCORRECTO:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoSubidoResponse {
  private List<ArchivoDTO> archivos;
  
  // Quizás no tenía el setter correcto
}
```

**✅ CORRECTO:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoSubidoResponse {
  private List<ArchivoDTO> archivos;  // Lista de {url: "..."}
}
```

---

### CORRECCIÓN 3: Clase ReporteResponse

**❌ INCORRECTO (Campos en inglés):**
```java
@Data
public class ReporteResponse {
  private long id;
  private long usuarioId;
  private String tipo;
  private String description;      // ❌ DEBE SER "descripcion"
  private String direction;        // ❌ DEBE SER "direccion"
  private String fotoUrl;
  private List<String> fotoUrls;
  private double lat;
  private double lng;
  private String zone;             // ❌ DEBE SER "zona"
  private String status;           // ❌ DEBE SER "estado"
  private boolean possibleDuplicate; // ❌ DEBE SER "posibleDuplicado"
  private String createdAt;        // ❌ DEBE SER "fechaCreacion"
  private String updatedAt;        // ❌ DEBE SER "fechaActualizacion"
}
```

**✅ CORRECTO (Nombres en español):**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResponse {
  private long id;
  private long usuarioId;
  private String tipo;
  private String descripcion;           // ✅ CORRECTO
  private String fotoUrl;
  private List<String> fotoUrls;
  private double lat;
  private double lng;
  private String direccion;             // ✅ CORRECTO
  private String zona;                  // ✅ CORRECTO
  private boolean posibleDuplicado;     // ✅ CORRECTO
  private String estado;                // ✅ CORRECTO (PENDIENTE, EN_PROCESO, RESUELTO)
  private String fechaCreacion;         // ✅ CORRECTO
  private String fechaActualizacion;    // ✅ CORRECTO
}
```

---

### CORRECCIÓN 4: UploadController - Método uploadReportes

**❌ INCORRECTO (Lo que probablemente tienes):**
```java
@PostMapping("/reportes")
public ResponseEntity<ApiResponse<ArchivoSubidoResponse>> uploadReportes(
    @RequestParam("files") MultipartFile[] files,
    HttpServletRequest request
) {
  try {
    List<ArchivoDTO> archivos = new ArrayList<>();
    
    for (MultipartFile file : files) {
      String fileName = file.getOriginalFilename();
      
      // ❌ GUARDAR Y OBTENER NOMBRE - INCORRECTO
      guardarArchivo(file);
      archivos.add(new ArchivoDTO(fileName));  // ❌ Guardando nombre, no URL
    }

    ArchivoSubidoResponse response = new ArchivoSubidoResponse();
    response.setArchivos(archivos);
    
    return ResponseEntity.ok(new ApiResponse<>(true, "Archivo subido", response, ...));
  } catch (Exception e) {
    return ResponseEntity.status(500).body(...);
  }
}
```

**✅ CORRECTO:**
```java
@PostMapping("/reportes")
public ResponseEntity<ApiResponse<ArchivoSubidoResponse>> uploadReportes(
    @RequestParam("files") MultipartFile[] files,
    HttpServletRequest request
) {
  try {
    // Validar archivos
    if (files == null || files.length == 0) {
      return ResponseEntity.badRequest().body(
        new ApiResponse<>(false, "No se enviaron archivos", null, request.getRequestURI())
      );
    }

    List<ArchivoDTO> archivos = new ArrayList<>();
    
    for (MultipartFile file : files) {
      // Validar tipo
      if (!file.getContentType().startsWith("image/")) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "Solo se permiten imágenes", null, request.getRequestURI())
        );
      }

      // Validar tamaño (10MB máximo)
      if (file.getSize() > 10 * 1024 * 1024) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "Archivo muy grande", null, request.getRequestURI())
        );
      }

      // ✅ GUARDAR Y OBTENER URL PÚBLICA
      String urlPublica = guardarArchivoYObtenerUrl(file);  // Debe retornar URL
      archivos.add(new ArchivoDTO(urlPublica));  // ✅ Guardando URL, no nombre
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
      new ApiResponse<>(false, "Error: " + e.getMessage(), null, request.getRequestURI())
    );
  }
}

// ✅ Este método debe retornar la URL PÚBLICA
private String guardarArchivoYObtenerUrl(MultipartFile file) throws Exception {
  String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
  String uploadDir = "uploads/reportes/";
  
  // Crear directorio si no existe
  Files.createDirectories(Paths.get(uploadDir));
  
  // Guardar archivo
  String filePath = uploadDir + fileName;
  Files.write(Paths.get(filePath), file.getBytes());
  
  // ✅ RETORNAR URL PÚBLICA (ajusta según tu servidor)
  return "http://localhost:8080/uploads/reportes/" + fileName;
}
```

---

### CORRECCIÓN 5: ReportesController - Método crear

**❌ INCORRECTO (Probablemente):**
```java
@PostMapping
public ResponseEntity<ApiResponse<ReporteResponse>> crear(
    @RequestBody ReporteRequest request,
    @AuthenticationPrincipal UserDetails user,
    HttpServletRequest httpRequest
) {
  Reporte reporte = new Reporte();
  reporte.setDescription(request.getDescripcion()); // ❌ Campo incorrecto
  reporte.setDirection(request.getDireccion());      // ❌ Campo incorrecto
  reporte.setZone(request.getZona());                // ❌ Campo incorrecto
  
  Reporte saved = reporteRepository.save(reporte);
  
  // El mapper devuelve campos en inglés
  ReporteResponse response = reporteMapper.toResponse(saved); // ❌ Usa campos en inglés
  
  return ResponseEntity.status(201).body(
    new ApiResponse<>(true, "Reporte creado", response, httpRequest.getRequestURI())
  );
}
```

**✅ CORRECTO:**
```java
@PostMapping
@PreAuthorize("hasAnyRole('CIUDADANO', 'OPERADOR', 'ADMIN')")
public ResponseEntity<ApiResponse<ReporteResponse>> crear(
    @RequestBody ReporteRequest request,
    @AuthenticationPrincipal UserDetails user,
    HttpServletRequest httpRequest
) {
  try {
    // Obtener usuario
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

    // Crear reporte
    Reporte reporte = new Reporte();
    reporte.setUsuarioId(usuario.getId());
    reporte.setTipo(request.getTipo());
    reporte.setDescripcion(request.getDescripcion());  // ✅ Nombre correcto
    reporte.setFotoUrl(request.getFotoUrl());
    reporte.setFotoUrls(request.getFotoUrls() != null ? request.getFotoUrls() : List.of(request.getFotoUrl()));
    reporte.setLat(request.getLat());
    reporte.setLng(request.getLng());
    reporte.setDireccion(request.getDireccion());      // ✅ Nombre correcto
    reporte.setZona(request.getZona());                // ✅ Nombre correcto
    reporte.setEstado("PENDIENTE");                    // ✅ Nombre correcto
    reporte.setFechaCreacion(LocalDateTime.now());     // ✅ Nombre correcto
    reporte.setFechaActualizacion(LocalDateTime.now());// ✅ Nombre correcto
    reporte.setPosibleDuplicado(false);                // ✅ Nombre correcto

    // Guardar
    Reporte saved = reporteRepository.save(reporte);

    // Mapear a response con nombres ESPAÑOLES
    ReporteResponse response = new ReporteResponse();
    response.setId(saved.getId());
    response.setUsuarioId(saved.getUsuarioId());
    response.setTipo(saved.getTipo());
    response.setDescripcion(saved.getDescripcion());      // ✅ Español
    response.setFotoUrl(saved.getFotoUrl());
    response.setFotoUrls(saved.getFotoUrls());
    response.setLat(saved.getLat());
    response.setLng(saved.getLng());
    response.setDireccion(saved.getDireccion());          // ✅ Español
    response.setZona(saved.getZona());                    // ✅ Español
    response.setEstado(saved.getEstado());                // ✅ Español
    response.setFechaCreacion(saved.getFechaCreacion().toString());     // ✅ Español
    response.setFechaActualizacion(saved.getFechaActualizacion().toString()); // ✅ Español
    response.setPosibleDuplicado(saved.isPosibleDuplicado()); // ✅ Español

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
      new ApiResponse<>(false, "Error: " + e.getMessage(), null, httpRequest.getRequestURI())
    );
  }
}
```

---

## 📋 CHECKLIST DE CORRECCIONES

- [ ] Cambiar `ArchivoDTO` - usar `url` en lugar de `nombreArchivo`
- [ ] Cambiar `ReporteResponse` - todos los campos en español:
  - [ ] `description` → `descripcion`
  - [ ] `direction` → `direccion`
  - [ ] `zone` → `zona`
  - [ ] `status` → `estado`
  - [ ] `possibleDuplicate` → `posibleDuplicado`
  - [ ] `createdAt` → `fechaCreacion`
  - [ ] `updatedAt` → `fechaActualizacion`
- [ ] Actualizar `UploadController.uploadReportes()` para devolver URLs públicas
- [ ] Actualizar `ReportesController.crear()` para devolver campos en español
- [ ] Verificar que `guardarArchivoYObtenerUrl()` devuelve URL, no nombre
- [ ] Agregar validaciones de tamaño y tipo de archivo
- [ ] Agregar CORS si frontend y backend en diferente puerto

---

## 🧪 Cómo Probar Después

### Con cURL (terminal/PowerShell):

**1. Subir imagen:**
```bash
curl -X POST http://localhost:8080/api/v1/uploads/reportes \
  -F "files=@imagen.jpg" \
  -H "Authorization: Bearer {TU_TOKEN}"
```

Deberías recibir:
```json
{
  "success": true,
  "data": {
    "archivos": [
      {
        "url": "http://localhost:8080/uploads/reportes/abc123-imagen.jpg"
      }
    ]
  }
}
```

**2. Crear reporte:**
```bash
curl -X POST http://localhost:8080/api/v1/reportes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TU_TOKEN}" \
  -d '{
    "tipo": "Fuga",
    "descripcion": "Hay una fuga grande",
    "fotoUrl": "http://localhost:8080/uploads/reportes/abc123-imagen.jpg",
    "fotoUrls": ["http://localhost:8080/uploads/reportes/abc123-imagen.jpg"],
    "lat": -12.046400,
    "lng": -77.042800,
    "direccion": "Av. Universitaria 500",
    "zona": "La Molina"
  }'
```

Deberías recibir:
```json
{
  "success": true,
  "data": {
    "id": 1234,
    "usuarioId": 567,
    "tipo": "Fuga",
    "descripcion": "Hay una fuga grande",
    "fotoUrl": "...",
    "zona": "La Molina",
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-05-24T10:30:00Z"
  }
}
```

---

**Con estos cambios, el frontend funcionará perfectamente.** 🚀
