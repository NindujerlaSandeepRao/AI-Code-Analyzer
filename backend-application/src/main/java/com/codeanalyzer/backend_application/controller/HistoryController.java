package com.codeanalyzer.backend_application.controller;

import com.codeanalyzer.backend_application.entity.AnalysisHistory;
import com.codeanalyzer.backend_application.repository.AnalysisHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/history")
@RequiredArgsConstructor
@CrossOrigin("*")
public class HistoryController {
    private final AnalysisHistoryRepository repository;

    @GetMapping
    public List<AnalysisHistory> getAll() {
        return repository.findAll();
    }
}
