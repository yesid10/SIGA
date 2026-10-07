package com.SIGA.SIGA.dto;

import jakarta.validation.constraints.NotBlank;

public record FirebaseAuthRequest(
        @NotBlank(message = "El Firebase ID Token es obligatorio")
        String idToken
) {}
