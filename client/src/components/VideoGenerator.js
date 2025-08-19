import React, { useState } from 'react';
import { generateVideos } from '../api/client';

function VideoGenerator({ segments }) {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleGenerateVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateVideos(segments);
      setVideos(result.videos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCostDisplay = () => {
    return `$${(segments.length * 8 * 0.75).toFixed(2)} (8 seconds × $0.75 per second)`;
  };

  return (
    <div className="video-generator">
      <h3>Video Generation</h3>
      
      <div className="video-info">
        <p><strong>Ready to generate {segments.length} video segments</strong></p>
        
        
        <p className="video-cost">Estimated cost: {getCostDisplay()}</p>
      </div>

      <button 
        className="generate-videos-button"
        onClick={handleGenerateVideos}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Generate Video Descriptions'}
      </button>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {videos && (
        <div className="videos-results">
          <h4>Video Description Results</h4>
          <p className="video-status">
            ✅ Generated descriptions for all {videos.length} segments
          </p>
          
          
          <button 
            className="toggle-details-button"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>

          {showDetails && (
            <div className="video-details">
              {videos.map((video, index) => (
                <div key={index} className="video-segment">
                  <h5>Segment {video.segmentNumber}</h5>
                  <div className="video-prompt">
                    <strong>Prompt:</strong>
                    <pre>{video.prompt}</pre>
                  </div>
                  {video.videoDescription && (
                    <div className="video-description">
                      <strong>Video Description:</strong>
                      <pre>{video.videoDescription}</pre>
                    </div>
                  )}
                  {video.duration && (
                    <p className="video-duration">Duration: {video.duration}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="veo3-note">
            <p><strong>Note:</strong> This generates detailed video descriptions that can be used with Google's Veo 3 API once available.</p>
            <p>The descriptions include camera angles, character states, dialogue timing, and scene continuity for seamless video generation.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoGenerator;