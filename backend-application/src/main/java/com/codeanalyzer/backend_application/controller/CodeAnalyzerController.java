package com.codeanalyzer.backend_application.controller;

import com.codeanalyzer.backend_application.service.CodeAnalyzerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/analyze")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CodeAnalyzerController {
    private final CodeAnalyzerService service;

    @PostMapping
    public Map<String, Object> analyze(@RequestParam("file") MultipartFile file) {
        return service.analyzeAndStore(file);
    }
}
