package com.darkdishlab.backend.controller;

import com.darkdishlab.backend.dto.GenerateRequest;
import com.darkdishlab.backend.dto.GenerateResponse;
import com.darkdishlab.backend.service.CursedCuisineService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CursedCuisineController {

    private final CursedCuisineService service;

    public CursedCuisineController(CursedCuisineService service) {
        this.service = service;
    }

    @PostMapping("/generate")
    public GenerateResponse generate(@RequestBody GenerateRequest request) {
        return service.generate(request);
    }
}