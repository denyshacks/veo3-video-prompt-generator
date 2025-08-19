import React, { useState } from 'react';
import { downloadSegments } from '../api/client';

function DownloadButton({ segments, metadata }) {
  const [showFormats, setShowFormats] = useState(false);
  
  const handleDownload = async (format = 'zip') => {
    try {
      if (format === 'zip') {
        await downloadSegments(segments);
      } else if (format === 'json') {
        downloadJSON();
      } else if (format === 'csv') {
        downloadCSV();
      } else if (format === 'pdf') {
        downloadPDF();
      }
    } catch (error) {
      alert('Failed to download segments. Please try again.');
    }
  };

  const downloadJSON = () => {
    const data = {
      metadata: metadata || {},
      segments: segments,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veo3-segments-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    // Create CSV headers
    const headers = [
      'Segment Number',
      'Duration',
      'Script Text',
      'Word Count',
      'Character State',
      'Location',
      'Camera Position'
    ];
    
    // Convert segments to CSV rows
    const rows = segments.map(segment => {
      return [
        segment.segment_info?.segment_number || '',
        segment.segment_info?.duration || '00:00-00:08',
        `"${(segment.action_timeline?.dialogue || '').replace(/"/g, '""')}"`,
        segment.action_timeline?.dialogue?.split(/\s+/).length || 0,
        `"${(segment.character_description?.current_state || '').replace(/"/g, '""')}"`,
        segment.segment_info?.location || '',
        segment.scene_continuity?.camera_position || ''
      ];
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veo3-segments-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // Create a formatted text version for PDF (using browser print)
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Veo 3 Script Segments</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c3e50; }
    .segment { page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; }
    .segment-header { background: #f8f9fa; margin: -20px -20px 15px -20px; padding: 10px 20px; }
    .field { margin-bottom: 10px; }
    .field-label { font-weight: bold; color: #555; }
    .script-text { background: #f0f0f0; padding: 10px; margin: 10px 0; border-left: 3px solid #3498db; }
    @media print { .segment { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Veo 3 Script Segments</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Total Segments: ${segments.length}</p>
  
  ${segments.map(segment => `
    <div class="segment">
      <div class="segment-header">
        <h2>Segment ${segment.segment_info?.segment_number || 'N/A'}</h2>
        <p>Duration: ${segment.segment_info?.duration || '00:00-00:08'}</p>
      </div>
      
      <div class="field">
        <span class="field-label">Script:</span>
        <div class="script-text">${segment.action_timeline?.dialogue || ''}</div>
      </div>
      
      <div class="field">
        <span class="field-label">Character State:</span>
        <p>${segment.character_description?.current_state || 'Not specified'}</p>
      </div>
      
      <div class="field">
        <span class="field-label">Location:</span> ${segment.segment_info?.location || 'Not specified'}
      </div>
      
      <div class="field">
        <span class="field-label">Camera:</span> ${segment.scene_continuity?.camera_position || 'Not specified'}
      </div>
      
      ${segment.action_timeline?.synchronized_actions ? `
        <div class="field">
          <span class="field-label">Actions:</span>
          <p>${segment.action_timeline.synchronized_actions}</p>
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="download-section">
      <button 
        className="download-button"
        onClick={() => setShowFormats(!showFormats)}
      >
        📥 Download Segments
      </button>
      
      {showFormats && (
        <div className="download-formats">
          <button 
            className="format-button"
            onClick={() => handleDownload('zip')}
            title="Download as ZIP with individual JSON files"
          >
            <span className="format-icon">📦</span>
            ZIP Archive
          </button>
          
          <button 
            className="format-button"
            onClick={() => handleDownload('json')}
            title="Download as single JSON file"
          >
            <span className="format-icon">📄</span>
            JSON File
          </button>
          
          <button 
            className="format-button"
            onClick={() => handleDownload('csv')}
            title="Download as CSV for spreadsheets"
          >
            <span className="format-icon">📊</span>
            CSV File
          </button>
          
          <button 
            className="format-button"
            onClick={() => handleDownload('pdf')}
            title="Print/Save as PDF"
          >
            <span className="format-icon">📑</span>
            PDF Report
          </button>
        </div>
      )}
    </div>
  );
}

export default DownloadButton;