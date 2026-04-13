package com.anonchat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReactionRequest {
    @NotBlank(message = "Reaction type is required")
    private String type; // ❤️, 🫂, 💪, 😢, 😊
}
