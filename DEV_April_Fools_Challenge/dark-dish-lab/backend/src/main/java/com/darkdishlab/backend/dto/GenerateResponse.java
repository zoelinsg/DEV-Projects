package com.darkdishlab.backend.dto;

public record GenerateResponse(
        String requestId,
        String type,      // FOOD or DRINK
        String rarity,    // Common/Rare/Epic/Cursed
        int horrorScore,  // 0-100
        boolean usedAi,   // true if Gemini was used
        String text       // the generated cursed recipe text
) {}