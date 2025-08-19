import React, { useState } from 'react';
import { generateSegments } from '../api/client';
import DownloadButton from './DownloadButton';
import ResultsDisplay from './ResultsDisplay';

function ContinuationMode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  // Form data - includes all options from standard mode
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
    // Advanced character details
    ethnicity: '',
    characterFeatures: '',
    clothingDetails: '',
    accentRegion: 'neutral-american'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSettingModeChange = (mode) => {
    setFormData({
      ...formData,
      settingMode: mode,
      locations: mode === 'single' ? [] : getDefaultLocations(mode)
    });
  };

  const getDefaultLocations = (mode) => {
    switch (mode) {
      case 'home-tour':
        return ['living room', 'kitchen', 'bedroom', 'bathroom'];
      case 'indoor-outdoor':
        return ['living room', 'porch', 'backyard', 'kitchen'];
      default:
        return [];
    }
  };

  const handleLocationChange = (index, value) => {
    const newLocations = [...formData.locations];
    newLocations[index] = value;
    setFormData({ ...formData, locations: newLocations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Add continuationMode flag to generate with voice/behavior focus
      const response = await generateSegments({
        ...formData,
        continuationMode: true
      });
      
      console.log('Continuation mode generation successful:', response);
      setResults({
        ...response,
        settings: formData
      });
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = [
    'living room', 'kitchen', 'bedroom', 'bathroom', 'home office',
    'dining room', 'porch', 'backyard', 'garage', 'balcony',
    'entryway', 'hallway', 'laundry room', 'walk-in closet'
  ];

  return (
    <div className="continuation-mode-container">
      <div className="continuation-header">
        <h2>Continuation Mode</h2>
        <p className="section-description">
          Generate video segments with enhanced voice and behavior consistency. The first segment includes full character details, 
          while subsequent segments focus on maintaining exact voice matching (100+ words) and behavioral patterns (100+ words).
        </p>
      </div>
      
      {!results ? (
        <form onSubmit={handleSubmit} className="form-container">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Character Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ageRange">Age Range *</label>
                <select
                  id="ageRange"
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={handleChange}
                  required
                >
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55+">55+</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </div>

            <div className="form-row">
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
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="energyLevel">Energy Level (%)</label>
                <input
                  type="number"
                  id="energyLevel"
                  name="energyLevel"
                  value={formData.energyLevel}
                  onChange={handleChange}
                  min="50"
                  max="100"
                  step="5"
                />
              </div>
            </div>
          </div>

          {/* Advanced Character Details */}
          <div className="form-section">
            <h3>Advanced Character Details</h3>
            <div className="form-row">
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

            <div className="form-row">
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
              </div>

              <div className="form-group">
                <label htmlFor="clothingDetails">Clothing Details (Optional)</label>
                <input
                  type="text"
                  id="clothingDetails"
                  name="clothingDetails"
                  value={formData.clothingDetails || ''}
                  onChange={handleChange}
                  placeholder="e.g., cream knit sweater, dark blue jeans, silver necklace..."
                />
              </div>
            </div>
          </div>

          {/* Product and Script */}
          <div className="form-section">
            <h3>Product and Script</h3>
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
              <label htmlFor="script">Full Script *</label>
              <textarea
                id="script"
                name="script"
                value={formData.script}
                onChange={handleChange}
                placeholder="Enter your complete UGC script here. It will be automatically split into 8-second segments..."
                rows={8}
                required
              />
              <p className="form-help-text">
                Each segment needs 15-22 words (6-8 seconds of speaking). Short sentences will be automatically combined.
              </p>
            </div>
          </div>

          {/* Setting Configuration */}
          <div className="form-section">
            <h3>Setting Configuration</h3>
            <div className="form-group">
              <label>Setting Mode</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="settingMode"
                    value="single"
                    checked={formData.settingMode === 'single'}
                    onChange={() => handleSettingModeChange('single')}
                  />
                  Single Location
                </label>
                <label>
                  <input
                    type="radio"
                    name="settingMode"
                    value="home-tour"
                    checked={formData.settingMode === 'home-tour'}
                    onChange={() => handleSettingModeChange('home-tour')}
                  />
                  Home Tour
                </label>
                <label>
                  <input
                    type="radio"
                    name="settingMode"
                    value="indoor-outdoor"
                    checked={formData.settingMode === 'indoor-outdoor'}
                    onChange={() => handleSettingModeChange('indoor-outdoor')}
                  />
                  Indoor/Outdoor Mix
                </label>
              </div>
            </div>

            {formData.settingMode === 'single' ? (
              <div className="form-group">
                <label htmlFor="room">Room/Location *</label>
                <select
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  required
                >
                  {locationOptions.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
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
                      {locationOptions.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <p className="form-help-text">
                  Locations will be assigned to segments in order. Extra segments use the last location.
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="style">Character Style *</label>
              <select
                id="style"
                name="style"
                value={formData.style}
                onChange={handleChange}
                required
              >
                <option value="casual and friendly">Casual & Friendly</option>
                <option value="polished professional">Polished Professional</option>
                <option value="authentic everyday">Authentic Everyday</option>
                <option value="enthusiastic influencer">Enthusiastic Influencer</option>
                <option value="calm expert">Calm Expert</option>
              </select>
            </div>
          </div>

          {/* Visual Production Settings */}
          <div className="form-section">
            <h3>Visual Production Settings</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cameraStyle">Camera Style</label>
                <select
                  id="cameraStyle"
                  name="cameraStyle"
                  value={formData.cameraStyle}
                  onChange={handleChange}
                >
                  <option value="static-handheld">Static Handheld</option>
                  <option value="smooth-movement">Smooth Movement</option>
                  <option value="dynamic-cuts">Dynamic Cuts</option>
                  <option value="documentary-style">Documentary Style</option>
                  <option value="pov-selfie">POV Selfie (phone-in-hand)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timeOfDay">Time of Day</label>
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  value={formData.timeOfDay}
                  onChange={handleChange}
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="golden-hour">Golden Hour</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productStyle">Product Display Style</label>
                <select
                  id="productStyle"
                  name="productStyle"
                  value={formData.productStyle}
                  onChange={handleChange}
                >
                  <option value="natural">Natural Handling</option>
                  <option value="hero-shots">Hero Shots</option>
                  <option value="lifestyle-integrated">Lifestyle Integrated</option>
                  <option value="demonstration-focused">Demonstration Focused</option>
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
                  <option value="consistent">Consistent Throughout</option>
                  <option value="building">Building Excitement</option>
                  <option value="problem-solution">Problem → Solution</option>
                  <option value="discovery">Discovery Journey</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="narrativeStyle">Narrative Style</label>
                <select
                  id="narrativeStyle"
                  name="narrativeStyle"
                  value={formData.narrativeStyle}
                  onChange={handleChange}
                >
                  <option value="direct-review">Direct Review</option>
                  <option value="storytelling">Storytelling</option>
                  <option value="educational">Educational</option>
                  <option value="testimonial">Testimonial</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="backgroundLife"
                    checked={formData.backgroundLife}
                    onChange={handleChange}
                  />
                  Include Background Life
                </label>
                <p className="form-help-text">
                  Add subtle background activity for realism
                </p>
              </div>
            </div>
          </div>

          {/* Output Format */}
          <div className="form-section">
            <h3>Output Format</h3>
            <div className="form-group">
              <label htmlFor="jsonFormat">JSON Format</label>
              <select
                id="jsonFormat"
                name="jsonFormat"
                value={formData.jsonFormat}
                onChange={handleChange}
              >
                <option value="standard">Standard (Balanced detail)</option>
                <option value="enhanced">Enhanced (Maximum continuity detail)</option>
              </select>
              <p className="form-help-text">
                Both formats will have enhanced voice/behavior sections in continuation mode
              </p>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Generating All Segments...' : 'Generate Continuation Segments'}
          </button>
        </form>
      ) : (
        <>
          <ResultsDisplay results={results} />
          {results.voiceProfile && (
            <div className="voice-profile-display">
              <h3>Voice Profile (Used for Consistency)</h3>
              <div className="voice-details">
                <p><strong>Technical Specs:</strong></p>
                <pre>{JSON.stringify(results.voiceProfile.technical, null, 2)}</pre>
                <p><strong>Base Voice:</strong></p>
                <p>{results.voiceProfile.baseVoice}</p>
              </div>
            </div>
          )}
          <DownloadButton segments={results.segments} metadata={results.metadata} />
          <button 
            onClick={() => setResults(null)}
            className="back-button"
          >
            Generate New Script
          </button>
        </>
      )}

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default ContinuationMode;