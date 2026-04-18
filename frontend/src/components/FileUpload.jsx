import { useState, useRef, useCallback } from "react";
import "./FileUpload.css";

const ALLOWED_TYPES = [".java", ".py", ".js", ".txt"];
const ALLOWED_MIME = [
  "text/x-java-source",
  "text/x-java",
  "application/java",
  "text/x-python",
  "text/javascript",
  "application/javascript",
  "text/plain",
  "text/x-script.python",
];

function getFileIcon(filename) {
  if (!filename) return "📄";
  const ext = filename.split(".").pop()?.toLowerCase();
  const icons = { java: "☕", py: "🐍", js: "⚡", txt: "📝" };
  return icons[ext] || "📄";
}

function isFileAllowed(file) {
  const name = file.name.toLowerCase();
  return ALLOWED_TYPES.some((ext) => name.endsWith(ext));
}

export default function FileUpload({ onFileSelect, selectedFile, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      setDragError("");
      if (!isFileAllowed(file)) {
        setDragError(`Unsupported type. Allowed: ${ALLOWED_TYPES.join(", ")}`);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="upload-wrapper">
      <div
        className={[
          "drop-zone",
          isDragging ? "dragging" : "",
          selectedFile ? "has-file" : "",
          disabled ? "disabled" : "",
          dragError ? "error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload code file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".java,.py,.js,.txt"
          onChange={handleInputChange}
          className="file-input-hidden"
          disabled={disabled}
        />

        <div className="drop-zone-content">
          {selectedFile ? (
            <>
              <span className="file-icon-big">{getFileIcon(selectedFile.name)}</span>
              <div className="file-info">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-meta">
                  {(selectedFile.size / 1024).toFixed(1)} KB ·{" "}
                  {selectedFile.name.split(".").pop()?.toUpperCase()}
                </span>
              </div>
              {!disabled && (
                <span className="change-hint">click or drop to change</span>
              )}
            </>
          ) : (
            <>
              <div className="upload-icon-wrap">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="upload-icon"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="drop-label">
                {isDragging ? "drop it here" : "drag & drop your file"}
              </p>
              <p className="drop-sublabel">
                or <span className="click-link">click to browse</span>
              </p>
              <div className="type-chips">
                {ALLOWED_TYPES.map((t) => (
                  <span key={t} className="type-chip">
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>

      {dragError && (
        <p className="upload-error-msg">
          <span>⚠</span> {dragError}
        </p>
      )}
    </div>
  );
}
