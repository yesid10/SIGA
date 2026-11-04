package com.SIGA.SIGA.config;

import com.cloudinary.Cloudinary;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName != null ? cloudName : "");
        config.put("api_key", apiKey != null ? apiKey : "");
        config.put("api_secret", apiSecret != null ? apiSecret : "");
        return new Cloudinary(config);
    }
}
