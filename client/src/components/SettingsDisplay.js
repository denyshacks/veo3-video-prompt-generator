import React from 'react';

function SettingsDisplay({ settings }) {
  if (!settings) return null;

  const formatSettingValue = (key, value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key === 'energyLevel') return `${value}%`;
    if (key === 'targetWordsPerSegment') return `${value} words`;
    if (key === 'locations' && Array.isArray(value)) return value.join(' → ');
    if (key === 'script') return `${value.substring(0, 50)}...`;
    return value || 'Not specified';
  };

  const settingLabels = {
    ageRange: 'Age Range',
    gender: 'Gender',
    product: 'Product',
    room: 'Room/Setting',
    style: 'Style',
    jsonFormat: 'JSON Format',
    settingMode: 'Setting Mode',
    locations: 'Location Sequence',
    cameraStyle: 'Camera Style',
    timeOfDay: 'Time of Day',
    backgroundLife: 'Background Life',
    productStyle: 'Product Display',
    energyArc: 'Energy Arc',
    narrativeStyle: 'Narrative Style',
    voiceType: 'Voice Type',
    energyLevel: 'Energy Level',
    targetWordsPerSegment: 'Words per Segment',
    ethnicity: 'Ethnicity',
    characterFeatures: 'Character Features',
    accentRegion: 'Accent/Region'
  };

  // Group settings by category
  const characterSettings = ['ageRange', 'gender', 'ethnicity', 'characterFeatures', 'voiceType', 'energyLevel', 'accentRegion'];
  const productSettings = ['product', 'productStyle'];
  const sceneSettings = ['settingMode', 'room', 'locations', 'timeOfDay', 'backgroundLife'];
  const visualSettings = ['cameraStyle', 'style', 'energyArc', 'narrativeStyle'];
  const technicalSettings = ['jsonFormat', 'targetWordsPerSegment'];

  const renderSettingGroup = (title, keys) => {
    const relevantSettings = keys.filter(key => 
      settings[key] !== undefined && 
      settings[key] !== '' && 
      settings[key] !== null &&
      key !== 'showPreview'
    );

    if (relevantSettings.length === 0) return null;

    return (
      <div className="settings-group">
        <h4>{title}</h4>
        <div className="settings-grid">
          {relevantSettings.map(key => (
            <div key={key} className="setting-item">
              <span className="setting-label">{settingLabels[key] || key}:</span>
              <span className="setting-value">{formatSettingValue(key, settings[key])}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="settings-display">
      <h3>Generation Settings</h3>
      <div className="settings-content">
        {renderSettingGroup('Character', characterSettings)}
        {renderSettingGroup('Product', productSettings)}
        {renderSettingGroup('Scene', sceneSettings)}
        {renderSettingGroup('Visual Style', visualSettings)}
        {renderSettingGroup('Technical', technicalSettings)}
      </div>
    </div>
  );
}

export default SettingsDisplay;