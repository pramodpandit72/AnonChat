package com.anonchat.service;

import com.anonchat.dto.CommentRequest;
import com.anonchat.dto.CommentResponse;
import com.anonchat.model.Comment;
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

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(String postId, String username, CommentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(user.getId());
        comment.setContent(request.getContent());
        comment.setAnonymousAvatar(user.getAnonymousAvatar());
        comment.setAnonymousName(user.getAnonymousName());
        comment.setCreatedAt(Instant.now());

        Comment savedComment = commentRepository.save(comment);

        // Update comment count on the post
        post.setCommentCount((int) commentRepository.countByPostId(postId));
        postRepository.save(post);

        return mapToResponse(savedComment, username);
    }

    public Page<CommentResponse> getComments(String postId, int page, int size, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
        return comments.map(comment -> mapToResponse(comment, currentUsername));
    }

    public void deleteComment(String commentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own comments");
        }

        String postId = comment.getPostId();
        commentRepository.delete(comment);

        // Update comment count
        postRepository.findById(postId).ifPresent(post -> {
            post.setCommentCount((int) commentRepository.countByPostId(postId));
            postRepository.save(post);
        });
    }

    private CommentResponse mapToResponse(Comment comment, String currentUsername) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPostId());
        response.setContent(comment.getContent());
        response.setAnonymousAvatar(comment.getAnonymousAvatar());
        response.setAnonymousName(comment.getAnonymousName());
        response.setCreatedAt(comment.getCreatedAt());

        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername).ifPresent(user ->
                    response.setOwnComment(comment.getUserId().equals(user.getId()))
            );
        }

        return response;
    }
}
