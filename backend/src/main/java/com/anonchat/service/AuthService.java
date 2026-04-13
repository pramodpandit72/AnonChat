package com.anonchat.service;

import com.anonchat.dto.AuthResponse;
import com.anonchat.dto.LoginRequest;
import com.anonchat.dto.SignupRequest;
import com.anonchat.model.User;
import com.anonchat.repository.UserRepository;
import com.anonchat.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    private static final String[] ANONYMOUS_ADJECTIVES = {
            "Silent", "Mystic", "Shadow", "Cosmic", "Velvet",
            "Crystal", "Golden", "Silver", "Lunar", "Solar",
            "Cloud", "Thunder", "Ocean", "Forest", "Arctic",
            "Neon", "Stellar", "Phantom", "Echo", "Aurora",
            "Crimson", "Azure", "Jade", "Amber", "Violet"
    };

    private static final String[] ANONYMOUS_NOUNS = {
            "Fox", "Wolf", "Eagle", "Owl", "Dolphin",
            "Phoenix", "Dragon", "Tiger", "Panda", "Falcon",
            "Raven", "Lynx", "Bear", "Hawk", "Swan",
            "Stag", "Otter", "Crane", "Jaguar", "Cobra",
            "Robin", "Whale", "Hare", "Gecko", "Condor"
    };

    private static final String[] AVATAR_EMOJIS = {
            "🦊", "🐺", "🦅", "🦉", "🐬",
            "🔥", "🐉", "🐯", "🐼", "🦋",
            "🌙", "⭐", "🌊", "🌲", "❄️",
            "🎭", "🦁", "🐨", "🦜", "🌸",
            "🎪", "🐋", "🐇", "🦎", "🌻"
    };

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Random random = new Random();
        String anonymousName = ANONYMOUS_ADJECTIVES[random.nextInt(ANONYMOUS_ADJECTIVES.length)]
                + " " + ANONYMOUS_NOUNS[random.nextInt(ANONYMOUS_NOUNS.length)]
                + " #" + (1000 + random.nextInt(9000));
        String anonymousAvatar = AVATAR_EMOJIS[random.nextInt(AVATAR_EMOJIS.length)];

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAnonymousName(anonymousName);
        user.setAnonymousAvatar(anonymousAvatar);
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());
        return new AuthResponse(token, "Account created successfully! You are now: " + anonymousName);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(token, "Welcome back, " + user.getAnonymousName() + "!");
    }
}
