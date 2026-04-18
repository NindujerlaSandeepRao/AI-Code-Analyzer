package com.codeanalyzer.backend_application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {
    private final RestTemplate restTemplate = new RestTemplate();

    public String analyzeWithAI(String code) {
        String url = "http://ollama:11434/api/generate";

        // Explicitly set Content-Type so Ollama reads stream:false correctly
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "tinyllama");
        body.put("stream", false);
        body.put("prompt",
                "You are a senior software engineer. Analyze this code briefly.\n" +
                        "Return exactly 3 short bullet points: issues, improvements, best practices.\n" +
                        "Be concise. No intro text.\n\n" +
                        code
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            System.out.println("Calling Ollama...");
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class
            );
            System.out.println("Ollama response: " + response.getBody());
            if (response.getBody() != null && response.getBody().get("response") != null) {
                return response.getBody().get("response").toString().trim();
            }
        } catch (Exception e) {
            System.out.println("AI call failed: " + e.getClass().getName() + " - " + e.getMessage());
        }

        return "AI not available";
    }
}
