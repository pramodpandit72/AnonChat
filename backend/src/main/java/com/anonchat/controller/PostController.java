package com.anonchat.controller;

import com.anonchat.dto.PostRequest;
import com.anonchat.dto.PostResponse;
import com.anonchat.dto.ReactionRequest;
import com.anonchat.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request,
                                                     Authentication authentication) {
        PostResponse response = postService.createPost(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String mood,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        Page<PostResponse> posts = postService.getAllPosts(page, size, category, mood, username);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<PostResponse>> getTrendingPosts() {
        List<PostResponse> trending = postService.getTrendingPosts();
        return ResponseEntity.ok(trending);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable String id,
                                                      Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        PostResponse response = postService.getPostById(id, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<Page<PostResponse>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Page<PostResponse> posts = postService.getMyPosts(authentication.getName(), page, size);
        return ResponseEntity.ok(posts);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable String id,
                                                            Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @PostMapping("/{id}/react")
    public ResponseEntity<PostResponse> reactToPost(@PathVariable String id,
                                                      @Valid @RequestBody ReactionRequest request,
                                                      Authentication authentication) {
        PostResponse response = postService.reactToPost(id, request.getType(), authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(Authentication authentication) {
        Map<String, Object> stats = postService.getUserStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }
}
