package com.anonchat.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class CommentResponse {
    private String id;
    private String postId;
    private String content;
    private String anonymousAvatar;
    private String anonymousName;
    private boolean ownComment;
    private Instant createdAt;
}
