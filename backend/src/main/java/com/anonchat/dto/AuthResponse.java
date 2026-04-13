package com.anonchat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private String message;

    public AuthResponse(String token, String message) {
        this.token = token;
        this.tokenType = "Bearer";
        this.message = message;
    }
}
