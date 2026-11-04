package com.SIGA.SIGA.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    public String subirImagen(MultipartFile archivo, String carpeta) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ReglaNegocioException("Debe proporcionar un archivo de imagen válido");
        }

        String contentType = archivo.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/octet-stream"))) {
            throw new ReglaNegocioException("El archivo debe ser una imagen válida (JPEG, PNG, WebP, etc.)");
        }

        if (cloudName == null || cloudName.isBlank()) {
            log.warn("Cloudinary no está configurado (CLOUDINARY_CLOUD_NAME vacío). Se omite subida remota.");
            throw new ReglaNegocioException("El servicio de Cloudinary no está configurado. Por favor configure las credenciales en .env.");
        }

        try {
            Map<?, ?> opciones = ObjectUtils.asMap(
                    "folder", carpeta != null && !carpeta.isBlank() ? "siga/" + carpeta : "siga/general",
                    "resource_type", "image"
            );

            Map<?, ?> resultado = cloudinary.uploader().upload(archivo.getBytes(), opciones);
            String url = (String) resultado.get("secure_url");
            if (url == null) {
                url = (String) resultado.get("url");
            }
            return url;
        } catch (IOException e) {
            log.error("Error al subir archivo a Cloudinary", e);
            throw new ReglaNegocioException("Error al comunicarse con Cloudinary: " + e.getMessage());
        }
    }
}
