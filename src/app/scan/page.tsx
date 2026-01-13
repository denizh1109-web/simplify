'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (!isScanning) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isScanning]);

  // Simulate OCR scanning
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setConfidence(prev => {
        const next = prev + Math.random() * 15;
        return Math.min(next, 100);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="sds-scan">
      <header className="sds-scan__header">
        <h1 className="sds-heading sds-heading--h2">Scan Document</h1>
        <p className="sds-text sds-text--secondary">
          Position document in viewfinder for OCR scanning
        </p>
      </header>

      <div className="sds-scan__container">
        <div className="sds-viewfinder">
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                className="sds-viewfinder__video"
                autoPlay
                playsInline
              />
              <div className="sds-viewfinder__overlay">
                <div className="sds-viewfinder__frame" />
              </div>
              <div className="sds-scan__pulse" />
            </>
          ) : (
            <div className="sds-viewfinder__placeholder">
              <div className="sds-icon sds-icon--lg">📸</div>
              <p className="sds-text sds-text--secondary">
                Camera access required
              </p>
            </div>
          )}
        </div>

        <div className="sds-scan__info">
          <div className="sds-card">
            <h3 className="sds-heading sds-heading--h4">Scan Progress</h3>
            <div className="sds-scan__progress">
              <div className="sds-progress-bar">
                <div
                  className="sds-progress-fill"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <p className="sds-text sds-text--metadata">
                Confidence: {Math.round(confidence)}%
              </p>
            </div>
          </div>

          <div className="sds-card">
            <h3 className="sds-heading sds-heading--h4">Tips</h3>
            <ul className="sds-tips">
              <li>📐 Ensure document is fully visible</li>
              <li>💡 Use good lighting</li>
              <li>🏞️ Keep camera steady</li>
              <li>✏️ Document should be flat</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="sds-scan__actions">
        <button
          className={`sds-btn ${isScanning ? 'sds-btn--error' : ''}`}
          onClick={() => {
            setIsScanning(!isScanning);
            if (isScanning) {
              setConfidence(0);
            }
          }}
        >
          {isScanning ? '⏹ Stop Scanning' : '▶ Start Scanning'}
        </button>
        {confidence === 100 && (
          <button className="sds-btn sds-btn--success">
            ✓ Continue to Summary
          </button>
        )}
      </div>

      <style jsx>{`
        .sds-scan {
          min-height: 100vh;
          background-color: var(--sds-bg);
          color: var(--sds-text);
          padding: var(--sds-space-lg);
        }

        .sds-scan__header {
          max-width: 1280px;
          margin: 0 auto var(--sds-space-2xl);
          text-align: center;
        }

        .sds-scan__header h1 {
          margin-bottom: var(--sds-space-md);
        }

        .sds-scan__container {
          max-width: 1280px;
          margin: 0 auto var(--sds-space-2xl);
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--sds-space-lg);
        }

        .sds-viewfinder {
          position: relative;
          aspect-ratio: 4 / 3;
          background-color: var(--sds-surface);
          border-radius: var(--sds-radius-lg);
          overflow: hidden;
          border: 2px solid var(--sds-divider);
        }

        .sds-viewfinder__video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sds-viewfinder__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .sds-viewfinder__frame {
          width: 80%;
          aspect-ratio: 8.5 / 11;
          border: 3px solid var(--sds-accent-clay);
          border-radius: var(--sds-radius-md);
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
        }

        .sds-viewfinder__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--sds-space-md);
          color: var(--sds-text-secondary);
        }

        .sds-scan__pulse {
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          border: 3px solid var(--sds-accent-clay);
          border-radius: var(--sds-radius-full);
          animation: sds-pulse 2s ease-in-out infinite;
        }

        @keyframes sds-pulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateX(-50%) scale(1.2);
            opacity: 0.5;
          }
        }

        .sds-scan__info {
          display: flex;
          flex-direction: column;
          gap: var(--sds-space-md);
        }

        .sds-scan__progress {
          margin-top: var(--sds-space-md);
        }

        .sds-progress-bar {
          width: 100%;
          height: 8px;
          background-color: var(--sds-divider);
          border-radius: var(--sds-radius-full);
          overflow: hidden;
          margin-bottom: var(--sds-space-sm);
        }

        .sds-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--sds-accent-clay), var(--sds-accent-rose));
          border-radius: var(--sds-radius-full);
          transition: width var(--sds-duration-productive) var(--sds-ease-productive);
        }

        .sds-tips {
          list-style: none;
          padding: 0;
          margin: var(--sds-space-md) 0 0;
          display: flex;
          flex-direction: column;
          gap: var(--sds-space-sm);
        }

        .sds-tips li {
          font-size: 14px;
          color: var(--sds-text-secondary);
        }

        .sds-scan__actions {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          gap: var(--sds-space-md);
          justify-content: center;
        }

        .sds-btn--error {
          background-color: var(--sds-error);
        }

        .sds-btn--error:hover:not(:disabled) {
          background-color: #8B3A42;
        }

        .sds-btn--success {
          background-color: var(--sds-success);
        }

        .sds-btn--success:hover:not(:disabled) {
          background-color: #5A4A37;
        }

        @media (max-width: 768px) {
          .sds-scan__container {
            grid-template-columns: 1fr;
          }

          .sds-viewfinder {
            aspect-ratio: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sds-scan__pulse {
            animation: none;
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
