package com.anonchat.repository;

import com.anonchat.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    Page<Comment> findByPostIdOrderByCreatedAtDesc(String postId, Pageable pageable);
    List<Comment> findByPostId(String postId);
    long countByPostId(String postId);
    void deleteByPostId(String postId);
}
