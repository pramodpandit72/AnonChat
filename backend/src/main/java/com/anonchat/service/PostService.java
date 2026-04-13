package com.anonchat.service;

import com.anonchat.dto.PostRequest;
import com.anonchat.dto.PostResponse;
import com.anonchat.model.Post;
import com.anonchat.model.User;
import com.anonchat.repository.CommentRepository;
import com.anonchat.repository.PostRepository;
import com.anonchat.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository,
                       CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    public PostResponse createPost(String username, PostRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setUserId(user.getId());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory());
        post.setMood(request.getMood());
        post.setAnonymousAvatar(user.getAnonymousAvatar());
        post.setAnonymousName(user.getAnonymousName());
        post.setReactions(new HashMap<>());
        post.setReactedUsers(new HashMap<>());
        post.setCreatedAt(Instant.now());

        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost, username);
    }

    public Page<PostResponse> getAllPosts(int page, int size, String category, String mood, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Post> posts;
        if (category != null && !category.isEmpty()) {
            posts = postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        } else if (mood != null && !mood.isEmpty()) {
            posts = postRepository.findByMoodOrderByCreatedAtDesc(mood, pageable);
        } else {
            posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return posts.map(post -> mapToResponse(post, currentUsername));
    }

    public PostResponse getPostById(String id, String currentUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Increment view count
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);

        return mapToResponse(post, currentUsername);
    }

    public Page<PostResponse> getMyPosts(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return posts.map(post -> mapToResponse(post, username));
    }

    public void deletePost(String postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own posts");
        }

        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    public PostResponse reactToPost(String postId, String reactionType, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Map<String, List<String>> reactedUsers = post.getReactedUsers();
        if (reactedUsers == null) reactedUsers = new HashMap<>();
        Map<String, Integer> reactions = post.getReactions();
        if (reactions == null) reactions = new HashMap<>();

        // Remove previous reaction if exists
        for (Map.Entry<String, List<String>> entry : reactedUsers.entrySet()) {
            if (entry.getValue().contains(user.getId())) {
                entry.getValue().remove(user.getId());
                reactions.put(entry.getKey(), Math.max(0, reactions.getOrDefault(entry.getKey(), 1) - 1));
                if (reactions.get(entry.getKey()) == 0) reactions.remove(entry.getKey());
                break;
            }
        }

        // Add new reaction
        reactedUsers.computeIfAbsent(reactionType, k -> new ArrayList<>()).add(user.getId());
        reactions.put(reactionType, reactions.getOrDefault(reactionType, 0) + 1);

        post.setReactions(reactions);
        post.setReactedUsers(reactedUsers);
        Post savedPost = postRepository.save(post);

        return mapToResponse(savedPost, username);
    }

    public List<PostResponse> getTrendingPosts() {
        // Get recent posts (last 7 days), sort by total reactions + comments + views
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Post> recentPosts = postRepository.findAllByOrderByCreatedAtDesc(pageable).getContent();

        // Sort by engagement (reactions + comments + views)
        recentPosts.sort((a, b) -> {
            int engagementA = getTotalReactions(a) + a.getCommentCount() + (a.getViewCount() / 10);
            int engagementB = getTotalReactions(b) + b.getCommentCount() + (b.getViewCount() / 10);
            return Integer.compare(engagementB, engagementA);
        });

        return recentPosts.stream()
                .limit(10)
                .map(post -> mapToResponse(post, null))
                .toList();
    }

    private int getTotalReactions(Post post) {
        if (post.getReactions() == null) return 0;
        return post.getReactions().values().stream().mapToInt(Integer::intValue).sum();
    }

    public Map<String, Object> getUserStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long postCount = postRepository.countByUserId(user.getId());
        List<Post> userPosts = postRepository.findByUserId(user.getId());

        int totalReactions = userPosts.stream()
                .mapToInt(this::getTotalReactions)
                .sum();

        int totalViews = userPosts.stream()
                .mapToInt(Post::getViewCount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("postCount", postCount);
        stats.put("totalReactions", totalReactions);
        stats.put("totalViews", totalViews);
        stats.put("anonymousName", user.getAnonymousName());
        stats.put("anonymousAvatar", user.getAnonymousAvatar());
        stats.put("memberSince", user.getCreatedAt());

        return stats;
    }

    private PostResponse mapToResponse(Post post, String currentUsername) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setCategory(post.getCategory());
        response.setMood(post.getMood());
        response.setAnonymousAvatar(post.getAnonymousAvatar());
        response.setAnonymousName(post.getAnonymousName());
        response.setReactions(post.getReactions() != null ? post.getReactions() : new HashMap<>());
        response.setCommentCount(post.getCommentCount());
        response.setViewCount(post.getViewCount());
        response.setCreatedAt(post.getCreatedAt());

        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername).ifPresent(user -> {
                response.setOwnPost(post.getUserId().equals(user.getId()));

                // Check if the user has reacted
                if (post.getReactedUsers() != null) {
                    for (Map.Entry<String, List<String>> entry : post.getReactedUsers().entrySet()) {
                        if (entry.getValue().contains(user.getId())) {
                            response.setUserReaction(entry.getKey());
                            break;
                        }
                    }
                }
            });
        }

        return response;
    }
}
