import React, { useState } from 'react';
import { generateNewCont } from '../api/clientNewCont';
import DownloadButton from './DownloadButton';
import ResultsDisplay from './ResultsDisplay';

function NewContinuationMode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [formData, setFormData] = useState({
    script: '',
    ageRange: '25-34',
    gender: 'female',
    product: '',
    voiceType: 'warm-friendly',
    energyLevel: '80',
    jsonFormat: 'standard',
    settingMode: 'single',
    room: 'living room',
    style: 'casual and friendly',
    locations: [],
    cameraStyle: 'static-handheld',
    timeOfDay: 'morning',
    backgroundLife: false,
    productStyle: 'natural',
    energyArc: 'consistent',
    narrativeStyle: 'direct-review',
    ethnicity: '',
    characterFeatures: '',
    clothingDetails: '',
    accentRegion: 'neutral-american',
    // Animal avatar controls
    useAnimalAvatar: true,
    animalPreset: 'tiger',
    animalVoiceStyle: 'narrator',
    anthropomorphic: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await generateNewCont(formData);
      setResults({ ...response, settings: formData });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="continuation-mode-container">
      <div className="continuation-header">
        <h2>New Cont. Mode</h2>
        <p className="section-description">Isolated continuation mode with animal avatar support.</p>
      </div>

      {!results ? (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-section">
            <h3>Animal Avatar</h3>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <input type="checkbox" name="useAnimalAvatar" checked={formData.useAnimalAvatar} onChange={handleChange} />
                  Use Animal Avatar
                </label>
              </div>
              <div className="form-group">
                <label>Preset</label>
                <select name="animalPreset" value={formData.animalPreset} onChange={handleChange}>
                  <option value="tiger">Tiger (powerful, poised)</option>
                  <option value="monkey">Monkey (playful, agile)</option>
                  <option value="fish">Fish (calm, fluid)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Voice Style</label>
                <select name="animalVoiceStyle" value={formData.animalVoiceStyle} onChange={handleChange}>
                  <option value="narrator">Narrator (neutral, articulate)</option>
                  <option value="deep-resonant">Deep & Resonant</option>
                  <option value="playful">Playful & Light</option>
                  <option value="calm-soothing">Calm & Soothing</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="anthropomorphic" checked={formData.anthropomorphic} onChange={handleChange} />
                  Anthropomorphic (human-like gestures)
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product & Script</h3>
            <div className="form-group">
              <label>Product *</label>
              <input type="text" name="product" value={formData.product} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Script *</label>
              <textarea name="script" value={formData.script} onChange={handleChange} rows={8} required />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Segments'}
          </button>
        </form>
      ) : (
        <>
          <ResultsDisplay results={results} />
          <DownloadButton segments={results.segments} metadata={results.metadata} />
          <button className="back-button" onClick={() => setResults(null)}>Generate New Script</button>
        </>
      )}

      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
}

export default NewContinuationMode; 