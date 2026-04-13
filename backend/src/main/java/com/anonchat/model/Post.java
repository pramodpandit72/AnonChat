package com.anonchat.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
public class Post {
    @Id
    private String id;

    private String userId; // internal - never exposed

    private String content;

    private String category; // thought, feeling, experience, emotion, rant, gratitude, advice

    private String mood; // happy, sad, angry, anxious, excited, peaceful, confused

    private String anonymousAvatar; // copied from user

    private String anonymousName; // copied from user

    // Reaction counts: {"❤️": 5, "🫂": 3, ...}
    private Map<String, Integer> reactions = new HashMap<>();

    // List of user IDs who reacted (internal tracking)
    private Map<String, List<String>> reactedUsers = new HashMap<>();

    private int commentCount = 0;

    private int viewCount = 0;

    @Indexed
    private Instant createdAt = Instant.now();
}
