package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.FirebaseAuthRequest;
import com.SIGA.SIGA.dto.LoginRequest;
import com.SIGA.SIGA.dto.LoginResponse;
import com.SIGA.SIGA.dto.RegisterRequest;
import com.SIGA.SIGA.services.AuthService;
import com.SIGA.SIGA.services.FirebaseAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final FirebaseAuthService firebaseAuthService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/firebase")
    public ResponseEntity<LoginResponse> exchangeFirebaseToken(@Valid @RequestBody FirebaseAuthRequest request) {
        return ResponseEntity.ok(firebaseAuthService.exchangeToken(request.idToken()));
    }
}
