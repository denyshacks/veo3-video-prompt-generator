import React, { useState, useEffect } from 'react';

function JSONEditor({ segment, onUpdate, onClose }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setJsonText(JSON.stringify(segment, null, 2));
    setHasChanges(false);
  }, [segment]);

  const handleChange = (e) => {
    setJsonText(e.target.value);
    setHasChanges(true);
    setError(null);
  };

  const validateAndSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Basic validation for required fields
      if (!parsed.segment_info) {
        throw new Error('segment_info is required');
      }
      if (!parsed.character_description) {
        throw new Error('character_description is required');
      }
      if (!parsed.action_timeline) {
        throw new Error('action_timeline is required');
      }
      
      // Word count validation for character description
      const physical = parsed.character_description?.physical || '';
      const clothing = parsed.character_description?.clothing || '';
      const physicalWords = physical.split(/\s+/).filter(w => w.length > 0).length;
      const clothingWords = clothing.split(/\s+/).filter(w => w.length > 0).length;
      
      if (physicalWords < 100) {
        setError(`Warning: Physical description has ${physicalWords} words (minimum 100 recommended)`);
      }
      if (clothingWords < 100) {
        setError(`Warning: Clothing description has ${clothingWords} words (minimum 100 recommended)`);
      }
      
      onUpdate(parsed);
      setHasChanges(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  const countWords = (text) => {
    return text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
  };

  const getFieldStats = () => {
    try {
      const parsed = JSON.parse(jsonText);
      return {
        physical: countWords(parsed.character_description?.physical),
        clothing: countWords(parsed.character_description?.clothing),
        voice: countWords(parsed.character_description?.voice_matching),
        dialogue: countWords(parsed.action_timeline?.dialogue),
        environment: countWords(parsed.scene_continuity?.environment)
      };
    } catch {
      return null;
    }
  };

  const stats = getFieldStats();

  return (
    <div className="json-editor-modal">
      <div className="json-editor-container">
        <div className="json-editor-header">
          <h3>Edit Segment {segment.segment_info?.segment_number || ''}</h3>
          <div className="json-editor-actions">
            <button 
              className="format-json-btn"
              onClick={formatJSON}
              title="Format JSON"
            >
              Format
            </button>
            <button 
              className="save-json-btn"
              onClick={validateAndSave}
              disabled={!hasChanges}
            >
              Save Changes
            </button>
            <button 
              className="close-json-btn"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className={`json-error ${error.includes('Warning') ? 'warning' : 'error'}`}>
            {error}
          </div>
        )}

        <div className="json-editor-content">
          <div className="json-editor-wrapper">
            <textarea
              className="json-editor-textarea"
              value={jsonText}
              onChange={handleChange}
              spellCheck={false}
              wrap="off"
            />
            <div className="line-numbers">
              {jsonText.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          </div>

          {stats && (
            <div className="json-stats">
              <h4>Word Counts</h4>
              <div className="stat-grid">
                <div className="stat-item">
                  <span>Physical:</span>
                  <span className={stats.physical < 100 ? 'low' : 'good'}>
                    {stats.physical} words
                  </span>
                </div>
                <div className="stat-item">
                  <span>Clothing:</span>
                  <span className={stats.clothing < 100 ? 'low' : 'good'}>
                    {stats.clothing} words
                  </span>
                </div>
                <div className="stat-item">
                  <span>Voice:</span>
                  <span className={stats.voice < 50 ? 'low' : 'good'}>
                    {stats.voice} words
                  </span>
                </div>
                <div className="stat-item">
                  <span>Dialogue:</span>
                  <span>{stats.dialogue} words</span>
                </div>
                <div className="stat-item">
                  <span>Environment:</span>
                  <span className={stats.environment < 150 ? 'low' : 'good'}>
                    {stats.environment} words
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="json-editor-tips">
          <p><strong>Tips:</strong></p>
          <ul>
            <li>Use Ctrl+F to find text</li>
            <li>Click "Format" to auto-format JSON</li>
            <li>Required: segment_info, character_description, action_timeline</li>
            <li>Minimum word counts: Physical (100), Clothing (100), Environment (150)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JSONEditor;