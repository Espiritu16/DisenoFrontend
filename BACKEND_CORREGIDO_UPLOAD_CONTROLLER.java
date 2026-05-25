package com.aquacomunidad.api.controller;

import com.aquacomunidad.api.dto.ApiResponse;
import com.aquacomunidad.api.dto.ArchivoSubidoResponse;
import com.aquacomunidad.api.dto.ArchivoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * ✅ CONTROLADOR CORREGIDO PARA UPLOADS
 *
 * IMPORTANTE: Reemplaza tu UploadController actual con este código
 *
 * Cambios:
 * 1. ✅ Devuelve "url" en lugar de "nombreArchivo"
 * 2. ✅ La respuesta sigue exactamente el formato esperado por el frontend
 * 3. ✅ Validaciones completas
 */

@RestController
@RequestMapping("/api/v1/uploads")
@CrossOrigin(origins = "http://localhost:4200")
public class UploadController {

  @PostMapping("/reportes")
  public ResponseEntity<ApiResponse<ArchivoSubidoResponse>> uploadReportes(
      @RequestParam("files") MultipartFile[] files,
      HttpServletRequest request
  ) {
    try {
      // Validar que hay archivos
      if (files == null || files.length == 0) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "No se enviaron archivos", null, request.getRequestURI())
        );
      }

      List<ArchivoDTO> archivos = new ArrayList<>();

      // Procesar cada archivo
      for (MultipartFile file : files) {
        // Validar que es imagen
        if (!file.getContentType().startsWith("image/")) {
          return ResponseEntity.badRequest().body(
            new ApiResponse<>(false, "Solo se permiten imágenes", null, request.getRequestURI())
          );
        }

        // Validar tamaño (10MB máximo)
        if (file.getSize() > 10 * 1024 * 1024) {
          return ResponseEntity.badRequest().body(
            new ApiResponse<>(false, "La imagen supera 10MB", null, request.getRequestURI())
          );
        }

        // ✅ AQUÍ GUARDAR EL ARCHIVO EN TU STORAGE
        // Reemplaza esto con tu lógica (S3, Cloudinary, local, etc)
        String urlPublica = guardarArchivoYObtenerUrl(file);

        // ✅ IMPORTANTE: Crear ArchivoDTO con "url" no "nombreArchivo"
        archivos.add(new ArchivoDTO(urlPublica));
      }

      // ✅ CREAR RESPUESTA CORRECTA
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
        new ApiResponse<>(false, "Error al subir: " + e.getMessage(), null, request.getRequestURI())
      );
    }
  }

  @PostMapping("/casos")
  public ResponseEntity<ApiResponse<ArchivoSubidoResponse>> uploadCasos(
      @RequestParam("files") MultipartFile[] files,
      HttpServletRequest request
  ) {
    // Mismo código que uploadReportes pero para casos
    try {
      if (files == null || files.length == 0) {
        return ResponseEntity.badRequest().body(
          new ApiResponse<>(false, "No se enviaron archivos", null, request.getRequestURI())
        );
      }

      List<ArchivoDTO> archivos = new ArrayList<>();

      for (MultipartFile file : files) {
        if (!file.getContentType().startsWith("image/")) {
          return ResponseEntity.badRequest().body(
            new ApiResponse<>(false, "Solo se permiten imágenes", null, request.getRequestURI())
          );
        }

        if (file.getSize() > 10 * 1024 * 1024) {
          return ResponseEntity.badRequest().body(
            new ApiResponse<>(false, "La imagen supera 10MB", null, request.getRequestURI())
          );
        }

        String urlPublica = guardarArchivoYObtenerUrl(file);
        archivos.add(new ArchivoDTO(urlPublica));
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
        new ApiResponse<>(false, "Error al subir: " + e.getMessage(), null, request.getRequestURI())
      );
    }
  }

  /**
   * 🔧 MÉTODO QUE NECESITAS IMPLEMENTAR
   *
   * Reemplaza esta implementación con tu lógica de storage:
   * - AWS S3
   * - Google Cloud Storage
   * - Cloudinary
   * - Local file system
   * - Azure Blob Storage
   * etc.
   *
   * Debe retornar la URL PÚBLICA donde se puede descargar el archivo
   */
  private String guardarArchivoYObtenerUrl(MultipartFile file) throws Exception {
    // OPCIÓN 1: Guardar localmente (simple para desarrollo)
    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
    String uploadDir = "uploads/reportes/";

    // Crear directorio si no existe
    java.nio.file.Files.createDirectories(java.nio.file.Paths.get(uploadDir));

    // Guardar archivo
    String filePath = uploadDir + fileName;
    java.nio.file.Files.write(
      java.nio.file.Paths.get(filePath),
      file.getBytes()
    );

    // Retornar URL pública (ajusta según tu servidor)
    return "http://localhost:8080/api/v1/uploads/descargar/" + fileName;

    // OPCIÓN 2: Si usas S3
    // return s3Service.uploadFile(file, "reportes");

    // OPCIÓN 3: Si usas Cloudinary
    // return cloudinaryService.uploadFile(file);
  }
}
