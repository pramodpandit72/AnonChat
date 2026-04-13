package com.anonchat.repository;

import com.anonchat.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);
    Page<Post> findByMoodOrderByCreatedAtDesc(String mood, Pageable pageable);
    Page<Post> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    List<Post> findByUserId(String userId);
    long countByUserId(String userId);
}
