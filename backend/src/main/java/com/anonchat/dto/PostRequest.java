package com.anonchat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 2000, message = "Content must be 1-2000 characters")
    private String content;

    private String category = "thought"; // thought, feeling, experience, emotion, rant, gratitude, advice

    private String mood = "neutral"; // happy, sad, angry, anxious, excited, peaceful, confused, neutral
}
