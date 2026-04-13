package com.anonchat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 500, message = "Comment must be 1-500 characters")
    private String content;
}
