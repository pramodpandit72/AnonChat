package com.anonchat.dto;

import lombok.Data;
import java.time.Instant;
import java.util.Map;

@Data
public class PostResponse {
    private String id;
    private String content;
    private String category;
    private String mood;
    private String anonymousAvatar;
    private String anonymousName;
    private Map<String, Integer> reactions;
    private int commentCount;
    private int viewCount;
    private boolean ownPost; // whether the current user owns this post
    private String userReaction; // current user's reaction, if any
    private Instant createdAt;
}
