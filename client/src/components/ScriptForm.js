import React, { useState, useEffect } from 'react';

function ScriptForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    script: '',
    ageRange: '25-34',
    gender: 'female',
    product: '',
    room: 'living room',
    style: 'casual and friendly',
    jsonFormat: 'standard', // 'standard' or 'enhanced'
    settingMode: 'single', // 'single', 'home-tour', 'indoor-outdoor'
    locations: [], // for mixed locations
    cameraStyle: 'static-handheld',
    timeOfDay: 'morning',
    backgroundLife: false,
    productStyle: 'natural',
    energyArc: 'consistent',
    narrativeStyle: 'direct-review',
    voiceType: 'warm-friendly',
    energyLevel: '80',
    targetWordsPerSegment: '20',
    showPreview: false,
    ethnicity: '',
    characterFeatures: '',
    accentRegion: 'neutral-american'
  });
  
  const [scriptPreview, setScriptPreview] = useState([]);
  const [savedSettings, setSavedSettings] = useState([]);

  // Load saved settings on component mount
  useEffect(() => {
    const saved = localStorage.getItem('ugcScriptSettings');
    if (saved) {
      try {
        setSavedSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved settings:', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'settingMode') {
      // Reset locations when changing setting mode
      let defaultLocations = [];
      if (value === 'home-tour') {
        defaultLocations = ['living room', 'kitchen', 'bedroom', 'home office'];
      } else if (value === 'indoor-outdoor') {
        defaultLocations = ['living room', 'porch', 'kitchen', 'backyard'];
      }
      
      setFormData({
        ...formData,
        [name]: value,
        locations: defaultLocations
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleLocationChange = (index, value) => {
    const newLocations = [...formData.locations];
    newLocations[index] = value;
    setFormData({
      ...formData,
      locations: newLocations
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Script preview logic
  const previewScript = () => {
    if (!formData.script || formData.script.trim().length < 50) {
      setScriptPreview([]);
      return;
    }

    const targetWords = parseInt(formData.targetWordsPerSegment) || 20;
    const minWords = Math.max(15, targetWords - 5);
    const maxWords = targetWords + 2;
    
    // Split into sentences
    const sentences = formData.script.match(/[^.!?]+[.!?]+/g) || [formData.script];
    
    const segments = [];
    let currentSegment = '';
    let currentWordCount = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const sentenceWords = sentence.split(/\s+/).length;
      
      if (currentSegment === '') {
        currentSegment = sentence;
        currentWordCount = sentenceWords;
        
        // Keep adding sentences until we meet minimum
        while (currentWordCount < minWords && i + 1 < sentences.length) {
          i++;
          const nextSentence = sentences[i].trim();
          const nextWords = nextSentence.split(/\s+/).length;
          
          if (currentWordCount + nextWords > maxWords) {
            if (currentWordCount < minWords) {
              currentSegment += ' ' + nextSentence;
              currentWordCount += nextWords;
            } else {
              i--;
              break;
            }
          } else {
            currentSegment += ' ' + nextSentence;
            currentWordCount += nextWords;
          }
        }
        
        segments.push({
          text: currentSegment,
          wordCount: currentWordCount,
          duration: Math.round((currentWordCount / 2.5) * 10) / 10 // Approximate seconds
        });
        currentSegment = '';
        currentWordCount = 0;
      }
    }
    
    setScriptPreview(segments);
  };

  // Update preview when script or target words change
  useEffect(() => {
    if (formData.showPreview) {
      previewScript();
    }
  }, [formData.script, formData.targetWordsPerSegment, formData.showPreview]);

  // Save/Load Settings Functions
  const saveSettings = () => {
    const settingsToSave = { ...formData };
    // Remove script and preview state from saved settings
    delete settingsToSave.script;
    delete settingsToSave.showPreview;
    
    const settingName = prompt('Enter a name for these settings:');
    if (settingName) {
      const existingSaved = [...savedSettings];
      const newSetting = {
        name: settingName,
        date: new Date().toLocaleDateString(),
        settings: settingsToSave
      };
      
      // Check if name already exists
      const existingIndex = existingSaved.findIndex(s => s.name === settingName);
      if (existingIndex >= 0) {
        if (window.confirm(`Settings "${settingName}" already exist. Overwrite?`)) {
          existingSaved[existingIndex] = newSetting;
        } else {
          return;
        }
      } else {
        existingSaved.push(newSetting);
      }
      
      localStorage.setItem('ugcScriptSettings', JSON.stringify(existingSaved));
      setSavedSettings(existingSaved);
      alert(`Settings "${settingName}" saved successfully!`);
    }
  };

  const loadSettings = (settingName) => {
    const setting = savedSettings.find(s => s.name === settingName);
    if (setting) {
      setFormData({
        ...formData,
        ...setting.settings,
        script: formData.script, // Keep current script
        showPreview: false
      });
      alert(`Settings "${settingName}" loaded!`);
    }
  };

  const deleteSettings = (settingName) => {
    if (window.confirm(`Delete settings "${settingName}"?`)) {
      const updated = savedSettings.filter(s => s.name !== settingName);
      localStorage.setItem('ugcScriptSettings', JSON.stringify(updated));
      setSavedSettings(updated);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="settings-controls">
        <h3>Settings Management</h3>
        <div className="settings-buttons">
          <button
            type="button"
            className="settings-button save-button"
            onClick={saveSettings}
          >
            💾 Save Current Settings
          </button>
          
          {savedSettings.length > 0 && (
            <div className="saved-settings-list">
              <label>Load Saved Settings:</label>
              <select
                onChange={(e) => e.target.value && loadSettings(e.target.value)}
                defaultValue=""
              >
                <option value="">Select settings to load...</option>
                {savedSettings.map((setting) => (
                  <option key={setting.name} value={setting.name}>
                    {setting.name} ({setting.date})
                  </option>
                ))}
              </select>
              {savedSettings.map((setting) => (
                <button
                  key={`delete-${setting.name}`}
                  type="button"
                  className="delete-settings-btn"
                  onClick={() => deleteSettings(setting.name)}
                  title={`Delete ${setting.name}`}
                >
                  🗑️
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="script">Script *</label>
        <textarea
          id="script"
          name="script"
          value={formData.script}
          onChange={handleChange}
          placeholder="Paste your UGC script here (minimum 50 characters)..."
          required
          minLength={50}
        />
        <p className="form-help-text">
          Each segment needs 15-22 words (6-8 seconds of speaking). Short sentences will be automatically combined.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="targetWordsPerSegment">Words per Segment (Target: {formData.targetWordsPerSegment})</label>
        <input
          type="range"
          id="targetWordsPerSegment"
          name="targetWordsPerSegment"
          value={formData.targetWordsPerSegment}
          onChange={handleChange}
          min="15"
          max="30"
          step="1"
        />
        <p className="form-help-text">
          Adjust the target word count per 8-second segment (15 = slower pace, 30 = faster pace)
        </p>
      </div>

      {formData.script && formData.script.trim().length >= 50 && (
        <div className="form-group">
          <button
            type="button"
            className="preview-button"
            onClick={() => setFormData({ ...formData, showPreview: !formData.showPreview })}
          >
            {formData.showPreview ? 'Hide' : 'Show'} Script Preview
          </button>
        </div>
      )}

      {formData.showPreview && scriptPreview.length > 0 && (
        <div className="script-preview">
          <h3>Script Preview - {scriptPreview.length} Segments</h3>
          <p className="preview-info">
            Total duration: ~{scriptPreview.reduce((sum, seg) => sum + seg.duration, 0).toFixed(1)} seconds
          </p>
          <div className="preview-segments">
            {scriptPreview.map((segment, index) => (
              <div key={index} className="preview-segment">
                <div className="preview-segment-header">
                  <span className="segment-number">Segment {index + 1}</span>
                  <span className="segment-stats">
                    {segment.wordCount} words | ~{segment.duration}s
                  </span>
                </div>
                <div className="preview-segment-text">
                  {segment.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="product">Product Name *</label>
        <input
          type="text"
          id="product"
          name="product"
          value={formData.product}
          onChange={handleChange}
          placeholder="e.g., Skincare Serum, Coffee Maker..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="ageRange">Age Range</label>
        <select
          id="ageRange"
          name="ageRange"
          value={formData.ageRange}
          onChange={handleChange}
        >
          <option value="18-24">18-24</option>
          <option value="25-34">25-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55+">55+</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-binary</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="voiceType">Voice Type</label>
        <select
          id="voiceType"
          name="voiceType"
          value={formData.voiceType}
          onChange={handleChange}
        >
          <option value="warm-friendly">Warm & Friendly</option>
          <option value="professional-clear">Professional & Clear</option>
          <option value="energetic-upbeat">Energetic & Upbeat</option>
          <option value="calm-soothing">Calm & Soothing</option>
          <option value="conversational-casual">Conversational & Casual</option>
          <option value="authoritative-confident">Authoritative & Confident</option>
          <option value="youthful-playful">Youthful & Playful</option>
        </select>
        <p className="form-help-text">
          Sets the vocal tone and delivery style for consistency across segments
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="energyLevel">Energy Level ({formData.energyLevel}%)</label>
        <input
          type="range"
          id="energyLevel"
          name="energyLevel"
          value={formData.energyLevel}
          onChange={handleChange}
          min="50"
          max="100"
          step="5"
        />
        <p className="form-help-text">
          Base energy level for delivery (50% = calm, 100% = highly enthusiastic)
        </p>
      </div>

      <div className="form-section">
        <h3>Advanced Character Details</h3>
        
        <div className="form-group">
          <label htmlFor="ethnicity">Ethnicity/Appearance</label>
          <select
            id="ethnicity"
            name="ethnicity"
            value={formData.ethnicity || ''}
            onChange={handleChange}
          >
            <option value="">Not specified</option>
            <option value="caucasian">Caucasian</option>
            <option value="african-american">African American</option>
            <option value="hispanic-latino">Hispanic/Latino</option>
            <option value="asian-east">East Asian</option>
            <option value="asian-south">South Asian</option>
            <option value="middle-eastern">Middle Eastern</option>
            <option value="mixed-race">Mixed Race</option>
            <option value="pacific-islander">Pacific Islander</option>
            <option value="native-american">Native American</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="characterFeatures">Specific Features (Optional)</label>
          <input
            type="text"
            id="characterFeatures"
            name="characterFeatures"
            value={formData.characterFeatures || ''}
            onChange={handleChange}
            placeholder="e.g., curly hair, glasses, freckles, beard..."
          />
          <p className="form-help-text">
            Add specific physical features to make the character more distinctive
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="accentRegion">Accent/Regional Voice</label>
          <select
            id="accentRegion"
            name="accentRegion"
            value={formData.accentRegion || 'neutral-american'}
            onChange={handleChange}
          >
            <option value="neutral-american">Neutral American</option>
            <option value="southern-us">Southern US</option>
            <option value="new-york">New York</option>
            <option value="midwest">Midwest</option>
            <option value="california">California</option>
            <option value="british-rp">British (RP)</option>
            <option value="british-regional">British Regional</option>
            <option value="australian">Australian</option>
            <option value="canadian">Canadian</option>
            <option value="irish">Irish</option>
            <option value="scottish">Scottish</option>
            <option value="international">International/Mixed</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="settingMode">Setting Mode</label>
        <select
          id="settingMode"
          name="settingMode"
          value={formData.settingMode}
          onChange={handleChange}
        >
          <option value="single">Single Location</option>
          <option value="home-tour">Mixed Locations - Home Tour</option>
          <option value="indoor-outdoor">Mixed Locations - Indoor/Outdoor</option>
        </select>
        <p className="form-help-text">
          {formData.settingMode === 'single' 
            ? 'Film in one consistent location'
            : formData.settingMode === 'home-tour'
            ? 'Move through different rooms in the home'
            : 'Mix indoor and outdoor locations'}
        </p>
      </div>

      {formData.settingMode === 'single' ? (
        <div className="form-group">
          <label htmlFor="room">Room/Setting</label>
          <select
            id="room"
            name="room"
            value={formData.room}
            onChange={handleChange}
          >
            <option value="living room">Living Room</option>
            <option value="kitchen">Kitchen</option>
            <option value="bathroom">Bathroom</option>
            <option value="bedroom">Bedroom</option>
            <option value="home office">Home Office</option>
            <option value="porch">Porch</option>
            <option value="backyard">Backyard/Patio</option>
          </select>
        </div>
      ) : (
        <div className="form-group">
          <label>Location Sequence</label>
          {formData.locations.map((location, index) => (
            <div key={index} className="location-item">
              <span>Segment {index + 1}:</span>
              <select
                value={location}
                onChange={(e) => handleLocationChange(index, e.target.value)}
              >
                <option value="living room">Living Room</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="bedroom">Bedroom</option>
                <option value="home office">Home Office</option>
                <option value="porch">Porch</option>
                <option value="backyard">Backyard/Patio</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="style">Style</label>
        <select
          id="style"
          name="style"
          value={formData.style}
          onChange={handleChange}
        >
          <option value="casual and friendly">Casual & Friendly</option>
          <option value="professional">Professional</option>
          <option value="energetic">Energetic</option>
          <option value="calm and soothing">Calm & Soothing</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="jsonFormat">JSON Format</label>
        <select
          id="jsonFormat"
          name="jsonFormat"
          value={formData.jsonFormat}
          onChange={handleChange}
        >
          <option value="standard">Standard (300+ words)</option>
          <option value="enhanced">Enhanced Continuity (500+ words)</option>
        </select>
        <p className="form-help-text">
          {formData.jsonFormat === 'enhanced' 
            ? 'Enhanced format includes detailed continuity markers and micro-expressions for seamless transitions'
            : 'Standard format provides comprehensive character and scene descriptions'}
        </p>
      </div>

      <div className="form-section">
        <h3>Visual & Production Settings</h3>
        
        <div className="form-group">
          <label htmlFor="cameraStyle">Camera Style</label>
          <select
            id="cameraStyle"
            name="cameraStyle"
            value={formData.cameraStyle}
            onChange={handleChange}
          >
            <option value="static-handheld">Static Handheld</option>
            <option value="slow-push">Slow Push In</option>
            <option value="orbit">Subtle Orbit Movement</option>
            <option value="dynamic">Dynamic Handheld</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="timeOfDay">Time of Day / Lighting</label>
          <select
            id="timeOfDay"
            name="timeOfDay"
            value={formData.timeOfDay}
            onChange={handleChange}
          >
            <option value="morning">Morning Light (soft, golden)</option>
            <option value="afternoon">Afternoon Bright (clear, white)</option>
            <option value="golden-hour">Golden Hour (warm, sunset)</option>
            <option value="evening">Cozy Evening (indoor lighting)</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="backgroundLife"
              checked={formData.backgroundLife}
              onChange={handleChange}
            />
            Add Background Life (pets, family members, natural sounds)
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Story & Presentation</h3>
        
        <div className="form-group">
          <label htmlFor="productStyle">Product Display Style</label>
          <select
            id="productStyle"
            name="productStyle"
            value={formData.productStyle}
            onChange={handleChange}
          >
            <option value="natural">Natural Integration</option>
            <option value="showcase">Feature Showcase</option>
            <option value="before-after">Before/After Demo</option>
            <option value="lifestyle">Lifestyle Context</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="energyArc">Energy Arc</label>
          <select
            id="energyArc"
            name="energyArc"
            value={formData.energyArc}
            onChange={handleChange}
          >
            <option value="consistent">Consistent Energy</option>
            <option value="building">Building Excitement</option>
            <option value="problem-solution">Problem to Solution</option>
            <option value="discovery">Discovery Journey</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="narrativeStyle">Narrative Style</label>
          <select
            id="narrativeStyle"
            name="narrativeStyle"
            value={formData.narrativeStyle}
            onChange={handleChange}
          >
            <option value="direct-review">Direct Review</option>
            <option value="day-in-life">Day in Life</option>
            <option value="problem-solver">Problem Solver</option>
            <option value="comparison">Comparison Story</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Segments'}
      </button>
    </form>
  );
}

export default ScriptForm;