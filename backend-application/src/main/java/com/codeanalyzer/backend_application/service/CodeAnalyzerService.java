package com.codeanalyzer.backend_application.service;

import com.codeanalyzer.backend_application.entity.AnalysisHistory;
import com.codeanalyzer.backend_application.repository.AnalysisHistoryRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CodeAnalyzerService {
    private final AiAnalysisService aiService;
    private final MinioClient minioClient;
    private final AnalysisHistoryRepository repository;

    private final String bucket = "code-uploads";

    public Map<String, Object> analyzeAndStore(MultipartFile file) {

        List<String> issues = new ArrayList<>();
        StringBuilder codeContent = new StringBuilder();

        try {

            // ✅ Read file safely (ONLY ONCE)
            byte[] fileBytes = file.getBytes();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new ByteArrayInputStream(fileBytes))
            );

            String line;
            int lineCount = 0;
            int longLines = 0;

            while ((line = reader.readLine()) != null) {
                lineCount++;
                codeContent.append(line).append("\n");

                if (line.contains("TODO")) {
                    issues.add("Found TODO comment");
                }

                if (line.length() > 120) {
                    longLines++;
                }
            }

            if (lineCount > 100) {
                issues.add("Too many lines (" + lineCount + ")");
            }

            if (longLines > 5) {
                issues.add("Too many long lines (>120 chars)");
            }

            // ✅ Upload to MinIO (SAFE)
            try {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(file.getOriginalFilename())
                                .stream(new ByteArrayInputStream(fileBytes), fileBytes.length, -1)
                                .contentType(file.getContentType())
                                .build()
                );
            } catch (Exception e) {
                System.out.println("MinIO failed: " + e.getMessage());
            }

            // ✅ AI Analysis (SAFE)
            String aiResponse = "AI not available";

            try {
                aiResponse = aiService.analyzeWithAI(codeContent.toString());
            } catch (Exception e) {
                System.out.println("AI failed: " + e.getMessage());
            }

            List<String> aiSuggestions = new ArrayList<>();
            if (aiResponse != null && !aiResponse.isEmpty()) {
                aiSuggestions.add(aiResponse);
            }

            // ✅ Score
            int score = Math.max(100 - (issues.size() * 10), 0);

            // ✅ Save to DB (SAFE)
            try {
                AnalysisHistory history = new AnalysisHistory(
                        null,
                        file.getOriginalFilename(),
                        score,
                        String.join(" | ", issues),
                        LocalDateTime.now()
                );
                repository.save(history);
            } catch (Exception e) {
                System.out.println("DB failed: " + e.getMessage());
            }

            // ✅ Response
            Map<String, Object> response = new HashMap<>();
            response.put("fileName", file.getOriginalFilename());
            response.put("issues", issues);
            response.put("aiSuggestions", aiSuggestions);
            response.put("score", score);

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error processing file: " + e);
        }
    }
}
