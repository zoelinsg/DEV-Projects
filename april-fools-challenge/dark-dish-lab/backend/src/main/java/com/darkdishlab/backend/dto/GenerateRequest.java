package com.darkdishlab.backend.dto;

import java.util.List;

public record GenerateRequest(
        List<String> selectedIngredients,
        List<String> selectedFlavors
) {}