package com.anonchat.controller;

import com.anonchat.dto.CommentRequest;
import com.anonchat.dto.CommentResponse;
import com.anonchat.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(@PathVariable String postId,
                                                        @Valid @RequestBody CommentRequest request,
                                                        Authentication authentication) {
        CommentResponse response = commentService.addComment(postId, authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        Page<CommentResponse> comments = commentService.getComments(postId, page, size, username);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable String postId,
                                                               @PathVariable String commentId,
                                                               Authentication authentication) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }
}
