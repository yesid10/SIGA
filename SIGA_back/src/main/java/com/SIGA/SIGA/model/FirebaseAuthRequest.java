package com.SIGA.SIGA.model;

import jakarta.validation.constraints.NotBlank;

public record FirebaseAuthRequest(
        @NotBlank(message = "El Firebase ID Token es obligatorio")
        String idToken
) {}
