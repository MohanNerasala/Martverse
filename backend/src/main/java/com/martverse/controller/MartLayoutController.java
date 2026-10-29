package com.martverse.controller;

import com.martverse.dto.ApiResponse;
import com.martverse.dto.MartLayoutDto;
import com.martverse.service.MartLayoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/mart", "/api/layout"})
@RequiredArgsConstructor
@Tag(name = "Supermarket Layout", description = "3D supermarket floor/aisle/placement data")
public class MartLayoutController {

    private final MartLayoutService martLayoutService;

    @GetMapping("/layout")
    @Operation(summary = "Get complete supermarket layout with all floors, aisles, and product placements")
    public ResponseEntity<ApiResponse<MartLayoutDto.FullLayoutResponse>> getFullLayout() {
        return ResponseEntity.ok(ApiResponse.success(martLayoutService.getFullLayout()));
    }

    @GetMapping("/floors")
    @Operation(summary = "Get all floors with their aisles and dimensions")
    public ResponseEntity<ApiResponse<List<MartLayoutDto.FloorResponse>>> getFloors() {
        return ResponseEntity.ok(ApiResponse.success(martLayoutService.getFloors()));
    }

    @GetMapping("/floors/{floorId}/aisles")
    @Operation(summary = "Get aisles for a specific floor")
    public ResponseEntity<ApiResponse<List<MartLayoutDto.AisleResponse>>> getAisles(
            @PathVariable String floorId) {
        return ResponseEntity.ok(ApiResponse.success(martLayoutService.getAislesForFloor(floorId)));
    }
}
