import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ResultCard from "./components/ResultCard";
import { analyzeFile } from "./services/api";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (f) => {
    setFile(f);
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file before analyzing.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeFile(file);
      setResult(data);
    } catch (err) {
      if (err.response) {
        setError(`Server error ${err.response.status}: ${err.response.data?.message || "Analysis failed."}`);
      } else if (err.request) {
        setError("Cannot reach the server. Make sure the backend is running on localhost:8080.");
      } else {
        setError("Unexpected error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="app">
      {/* Background grid */}
      <div className="bg-grid" aria-hidden />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-eyebrow">
            <span className="dot dot-pulse" />
            <span>v1.0 · async analyzer</span>
          </div>
          <h1 className="app-title">
            AI<span className="title-accent">Code</span>Analyzer
          </h1>
          <p className="app-subtitle">
            Upload your source file and receive an instant quality report
          </p>
        </header>

        {/* Main panel */}
        <main className="main-panel">
          {!result ? (
            <>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={file}
                disabled={loading}
              />

              {error && (
                <div className="error-banner" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button
                className={["analyze-btn", loading ? "loading" : "", !file ? "idle" : ""].join(" ")}
                onClick={handleAnalyze}
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Analyzing<span className="ellipsis"><span>.</span><span>.</span><span>.</span></span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Analyze File
                  </>
                )}
              </button>

              {loading && (
                <div className="loading-status">
                  <div className="progress-bar">
                    <div className="progress-fill" />
                  </div>
                  <p className="loading-text">Scanning <code>{file?.name}</code> for issues...</p>
                </div>
              )}
            </>
          ) : (
            <ResultCard result={result} onReset={handleReset} />
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <span>Supported: .java · .py · .js · .txt</span>
          <span>Backend: localhost:8080</span>
        </footer>
      </div>
    </div>
  );
}
