package com.SIGA.SIGA.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.google.api.client.http.javanet.NetHttpTransport;

@Configuration
@ConditionalOnProperty(name = "siga.firebase.enabled", havingValue = "true")
@ConditionalOnExpression("'${siga.firebase.service-account-json:}' != '' or '${siga.firebase.service-account-json-base64:}' != ''")
public class FirebaseConfig {

    @Bean
    FirebaseApp firebaseApp(
            @Value("${siga.firebase.project-id}") String projectId,
            @Value("${siga.firebase.client-email}") String clientEmail,
            @Value("${siga.firebase.private-key}") String privateKey,
            @Value("${siga.firebase.service-account-json}") String serviceAccountJson,
            @Value("${siga.firebase.service-account-json-base64}") String serviceAccountJsonBase64) throws Exception {
        String completeJson = serviceAccountJson;
        if (completeJson.isBlank() && !serviceAccountJsonBase64.isBlank()) {
            completeJson = new String(Base64.getDecoder().decode(serviceAccountJsonBase64), StandardCharsets.UTF_8);
        }

        if (!completeJson.isBlank()) {
            return FirebaseApp.initializeApp(FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(
                            new ByteArrayInputStream(completeJson.getBytes(StandardCharsets.UTF_8))))
                    .setProjectId(projectId)
                    .setHttpTransport(new NetHttpTransport())
                    .build());
        }

        throw new IllegalStateException("Configura FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 con el JSON completo de Firebase Admin SDK");
    }
}
