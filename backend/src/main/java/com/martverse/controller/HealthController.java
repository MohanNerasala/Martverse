package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Health Check", description = "Instant zero-overhead backend health probe")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Instant health probe returning in <1ms without DB roundtrip")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.success("Martverse backend is online", Map.of(
                "status", "UP",
                "service", "martverse-backend",
                "timestamp", System.currentTimeMillis()
        )));
    }
}

