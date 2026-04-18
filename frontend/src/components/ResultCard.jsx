import { useEffect, useState } from "react";
import "./ResultCard.css";

function ScoreRing({ score }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 80);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;

  const color =
    score >= 80 ? "var(--success)" : score >= 50 ? "var(--warn)" : "var(--danger)";

  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";

  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110" className="score-svg">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s" }}
        />
      </svg>
      <div className="score-center">
        <span className="score-number" style={{ color }}>
          {score}
        </span>
        <span className="score-label" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function ResultCard({ result, onReset }) {
  const { fileName, issues = [], aiSuggestions = [], score } = result;

  return (
    <div className="result-card">
      {/* Header */}
      <div className="result-header">
        <div className="result-header-left">
          <span className="result-badge">ANALYSIS COMPLETE</span>
          <h2 className="result-filename">{fileName}</h2>
        </div>
        <button className="reset-btn" onClick={onReset} title="Analyze another file">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 .49-4"></path>
          </svg>
          New File
        </button>
      </div>

      {/* Body */}
      <div className="result-body">
        {/* Score section */}
        <div className="score-section">
          <ScoreRing score={score} />
          <p className="score-caption">Code Quality Score</p>
        </div>

        {/* Issues section */}
        <div className="issues-section">
          <div className="issues-header">
            <span className="issues-title">Issues Detected</span>
            <span className="issues-count">{issues.length}</span>
          </div>

          {issues.length === 0 ? (
            <div className="no-issues">
              <span className="no-issues-icon">✓</span>
              <span>No issues found — clean code!</span>
            </div>
          ) : (
            <ul className="issues-list">
              {issues.map((issue, i) => (
                <li
                  key={i}
                  className="issue-item"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="issue-dot" />
                  <span className="issue-text">{issue}</span>
                </li>
              ))}
            </ul>
          )}
          {aiSuggestions.length > 0 && (
            <div className="ai-section">
              <div className="ai-header">
                <span className="ai-icon">✦</span>
                <span className="ai-title">AI Insights</span>
              </div>
              <div className="ai-box">
                {aiSuggestions.map((ai, i) => (
                  <p key={i} className="ai-text">{ai}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="result-footer">
        <span className="footer-tag">
          <span className="dot dot-green" />
          analysis complete
        </span>
        <span className="footer-tag">
          {issues.length} issue{issues.length !== 1 ? "s" : ""}
        </span>
        <span className="footer-tag">score: {score}/100</span>
      </div>
    </div>
  );
}
