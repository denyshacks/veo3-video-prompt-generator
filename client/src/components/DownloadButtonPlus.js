import React, { useState } from 'react';
import { downloadSegmentsPlus } from '../api/clientPlus';

function DownloadButtonPlus({ segments, metadata }) {
  const [showFormats, setShowFormats] = useState(false);

  const handleDownload = async () => {
    try {
      await downloadSegmentsPlus(segments);
    } catch (error) {
      alert('Failed to download segments (plus). Please try again.');
    }
  };

  return (
    <div className="download-section">
      <button className="download-button" onClick={() => setShowFormats(!showFormats)}>
        📥 Download Segments (Plus)
      </button>
      {showFormats && (
        <div className="download-formats">
          <button className="format-button" onClick={handleDownload}>
            <span className="format-icon">📦</span>
            ZIP Archive
          </button>
        </div>
      )}
    </div>
  );
}

export default DownloadButtonPlus; 