package com.anonchat.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;

    private String postId;

    private String userId; // internal - never exposed

    private String content;

    private String anonymousAvatar;

    private String anonymousName;

    private Instant createdAt = Instant.now();
}
