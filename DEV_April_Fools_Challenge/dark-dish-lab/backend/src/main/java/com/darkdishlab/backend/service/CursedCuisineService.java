package com.darkdishlab.backend.service;

import com.darkdishlab.backend.dto.GenerateRequest;
import com.darkdishlab.backend.dto.GenerateResponse;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class CursedCuisineService {

    private final Dotenv dotenv = Dotenv.configure()
            .filename(".env.local")
            .ignoreIfMissing()
            .load();

    private volatile Client client;

    private static final List<Ing> POOL = List.of(
            new Ing("Tri-Color Veggie Mix", false, 3),
            new Ing("Wasabi", true, 5),
            new Ing("Ghost Pepper", true, 9),
            new Ing("Tapioca Pearls", true, 3),
            new Ing("Cilantro", true, 6),
            new Ing("Chocolate", true, 2),
            new Ing("Pineapple", true, 4),
            new Ing("Century Egg", false, 8),
            new Ing("Natto", false, 8),
            new Ing("Durian", true, 9),
            new Ing("Eggplant", false, 4),
            new Ing("Bitter Melon", true, 7),
            new Ing("Blue Cheese", true, 7),
            new Ing("Black Garlic", true, 5),
            new Ing("Red Beans (Adzuki)", true, 2),
            new Ing("Matcha", true, 3),
            new Ing("Pork Belly", false, 4),
            new Ing("Chicken Skin", false, 5),
            new Ing("Beef Meatballs", false, 3),
            new Ing("Mint", true, 4),
            new Ing("Lemon", true, 2),
            new Ing("Orange", true, 2),
            new Ing("Soy Sauce", true, 4),
            new Ing("Shrimp Paste", false, 8),
            new Ing("Duck Head", false, 9),
            new Ing("Passion Fruit", true, 3),
            new Ing("Watermelon", true, 2),
            new Ing("Papaya", true, 3),
            new Ing("Sesame Paste (Tahini-like)", true, 4),
            new Ing("Softshell Turtle", false, 9),
            new Ing("Curry", true, 4),
            new Ing("Hagfish", false, 10),
            new Ing("Taro", true, 3),
            new Ing("Pudding", true, 2)
    );

    private static final Map<String, Ing> POOL_MAP = buildPoolMap();

    private static Map<String, Ing> buildPoolMap() {
        Map<String, Ing> m = new HashMap<>();
        for (Ing i : POOL) m.put(i.name.toLowerCase(Locale.ROOT), i);
        return m;
    }

    private record Ing(String name, boolean drinkable, int horrorWeight) {}

    public GenerateResponse generate(GenerateRequest req) {
        String requestId = UUID.randomUUID().toString();

        List<String> flavors = req.selectedFlavors() == null ? new ArrayList<>() : new ArrayList<>(req.selectedFlavors());
        if (flavors.isEmpty()) flavors = randomFlavors();

        String type = decideType(flavors);

        List<String> selectedNames = req.selectedIngredients() == null ? new ArrayList<>() : new ArrayList<>(req.selectedIngredients());
        List<Ing> picked = pickIngredients(type, selectedNames);

        int score = calcScore(flavors, picked);
        String rarity = score >= 90 ? "Cursed" : score >= 75 ? "Epic" : score >= 60 ? "Rare" : "Common";

        boolean aiEnabled = !"false".equalsIgnoreCase(firstNonBlank(dotenv.get("AI_ENABLED"), "true"));
        String apiKey = firstNonBlank(dotenv.get("GOOGLE_API_KEY"), dotenv.get("GEMINI_API_KEY"));
        String model = firstNonBlank(dotenv.get("GEMINI_MODEL"), "gemini-2.5-flash-lite");

        String text;
        boolean usedAi = false;

        if (aiEnabled && apiKey != null && !apiKey.isBlank()) {
            try {
                Client c = getOrCreateClient(apiKey);
                String ai = callGemini(c, model, type, flavors, picked);
                text = formatShort(type, rarity, score, flavors, picked, ai);
                usedAi = true;
            } catch (Exception e) {
                text = formatShort(type, rarity, score, flavors, picked, null);
            }
        } else {
            text = formatShort(type, rarity, score, flavors, picked, null);
        }

        return new GenerateResponse(requestId, type, rarity, score, usedAi, text);
    }

    private Client getOrCreateClient(String apiKey) {
        if (client == null) {
            synchronized (this) {
                if (client == null) client = Client.builder().apiKey(apiKey).build();
            }
        }
        return client;
    }

    private String callGemini(Client c, String model, String type, List<String> flavors, List<Ing> picked) {
        String prompt = """
Write a VERY SHORT cursed %s recipe in English.

Rules:
- NO emojis.
- Max 60 words total.
- Use exactly 3 steps, each <= 12 words.
- Provide 1 warning line <= 12 words.

Context:
Flavors: %s
Ingredients: %s

Output format (strict):
Name: ...
Steps: step1 | step2 | step3
Warning: ...
""".formatted(type, String.join(", ", flavors), picked.stream().map(i -> i.name).toList());

        GenerateContentResponse resp = c.models.generateContent(model, prompt, null);
        String txt = resp.text();
        return txt == null ? "" : txt.trim();
    }

    private String formatShort(String type, String rarity, int score, List<String> flavors, List<Ing> picked, String aiText) {
        String flavorCombo = String.join("-", flavors);
        List<String> ingNames = picked.stream().map(i -> i.name).toList();

        String name = "%s %s %s: %s x %s".formatted(rarity, flavorCombo, type, ingNames.get(0), ingNames.get(1));
        String steps =
                "- Mix everything with zero confidence.\n" +
                        "- Apply heat until logic disappears.\n" +
                        "- Serve quietly. Deny responsibility.\n";
        String warning = "⚠️ Warning: Not recommended before important meetings.";

        if (aiText != null && !aiText.isBlank()) {
            name = extractLine(aiText, "Name:", name);
            String parsedSteps = extractLine(aiText, "Steps:", null);
            if (parsedSteps != null) {
                String[] parts = parsedSteps.split("\\|");
                if (parts.length >= 3) {
                    steps =
                            "- " + parts[0].trim() + "\n" +
                                    "- " + parts[1].trim() + "\n" +
                                    "- " + parts[2].trim() + "\n";
                }
            }
            warning = extractLine(aiText, "Warning:", warning);
            if (!warning.startsWith("⚠️")) warning = "⚠️ " + warning;
        }

        String out = """
🎲 Name: %s
🔥 Horror Score: %d/100 (%s)
🧪 Ingredients:
- %s
- %s
- %s
🧪 Steps:
%s%s
""".formatted(
                name,
                score,
                rarity,
                ingNames.get(0), ingNames.get(1), ingNames.get(2),
                steps,
                warning
        );

        return out.length() > 900 ? out.substring(0, 900) + "\n⚠️ (trimmed)" : out;
    }

    private String extractLine(String text, String prefix, String fallback) {
        for (String line : text.split("\n")) {
            if (line.trim().startsWith(prefix)) {
                return line.trim().substring(prefix.length()).trim();
            }
        }
        return fallback;
    }

    private int calcScore(List<String> flavors, List<Ing> picked) {
        int base = 30 + ThreadLocalRandom.current().nextInt(0, 21);
        int weightSum = picked.stream().mapToInt(i -> i.horrorWeight).sum();
        int flavorBonus = flavors.size() * 6;
        return Math.min(100, base + weightSum + flavorBonus);
    }

    private List<Ing> pickIngredients(String type, List<String> selectedNames) {
        List<Ing> base;

        if (selectedNames != null && !selectedNames.isEmpty()) {
            base = new ArrayList<>();
            for (String n : selectedNames) {
                Ing found = POOL_MAP.getOrDefault(n.toLowerCase(Locale.ROOT), new Ing(n, true, 5));
                base.add(found);
            }
        } else {
            base = new ArrayList<>(POOL);
        }

        if ("DRINK".equals(type)) {
            List<Ing> drinkables = base.stream().filter(i -> i.drinkable).toList();
            if (drinkables.size() >= 3) base = new ArrayList<>(drinkables);
        }

        Collections.shuffle(base);
        if (base.size() < 3) {
            List<Ing> fallback = new ArrayList<>(POOL);
            Collections.shuffle(fallback);
            return fallback.subList(0, 3);
        }
        return base.subList(0, 3);
    }

    private String decideType(List<String> flavors) {
        boolean sweetOrSour = flavors.stream().anyMatch(f -> f.equalsIgnoreCase("sweet") || f.equalsIgnoreCase("sour"));
        boolean saltyOrSpicy = flavors.stream().anyMatch(f -> f.equalsIgnoreCase("salty") || f.equalsIgnoreCase("spicy"));
        if (sweetOrSour && !saltyOrSpicy) return "DRINK";
        if (!sweetOrSour && saltyOrSpicy) return "FOOD";
        return ThreadLocalRandom.current().nextBoolean() ? "FOOD" : "DRINK";
    }

    private List<String> randomFlavors() {
        List<String> all = new ArrayList<>(List.of("salty", "sweet", "spicy", "sour"));
        Collections.shuffle(all);
        int n = 1 + ThreadLocalRandom.current().nextInt(3);
        return all.subList(0, n);
    }

    private String firstNonBlank(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return null;
    }
}