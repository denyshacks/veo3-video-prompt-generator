import React, { useState } from 'react';

function BulkOperations({ segments, onUpdate }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    dialogue: true,
    physical: true,
    clothing: true,
    environment: true,
    current_state: true,
    voice_matching: true,
    camera_position: true,
    location: true
  });
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleFieldToggle = (field) => {
    setSelectedFields({
      ...selectedFields,
      [field]: !selectedFields[field]
    });
  };

  const searchInObject = (obj, searchText, path = '') => {
    const matches = [];
    
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof obj[key] === 'string') {
        const regex = new RegExp(
          caseSensitive ? searchText : searchText.toLowerCase(), 
          caseSensitive ? 'g' : 'gi'
        );
        const found = obj[key].match(regex);
        
        if (found && found.length > 0) {
          // Check if this field is selected
          const fieldName = currentPath.split('.').pop();
          if (selectedFields[fieldName] || 
              currentPath.includes('dialogue') && selectedFields.dialogue ||
              currentPath.includes('physical') && selectedFields.physical ||
              currentPath.includes('clothing') && selectedFields.clothing ||
              currentPath.includes('environment') && selectedFields.environment ||
              currentPath.includes('current_state') && selectedFields.current_state ||
              currentPath.includes('voice_matching') && selectedFields.voice_matching ||
              currentPath.includes('camera_position') && selectedFields.camera_position ||
              currentPath.includes('location') && selectedFields.location) {
            matches.push({
              path: currentPath,
              value: obj[key],
              count: found.length
            });
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        matches.push(...searchInObject(obj[key], searchText, currentPath));
      }
    }
    
    return matches;
  };

  const handleSearch = () => {
    if (!findText) {
      alert('Please enter text to search for');
      return;
    }

    setIsSearching(true);
    const searchResults = [];
    
    segments.forEach((segment, index) => {
      const matches = searchInObject(segment, findText);
      if (matches.length > 0) {
        searchResults.push({
          segmentIndex: index,
          segmentNumber: segment.segment_info?.segment_number || index + 1,
          matches: matches
        });
      }
    });
    
    setResults(searchResults);
    setIsSearching(false);
  };

  const handleReplace = () => {
    if (!findText) {
      alert('Please enter text to search for');
      return;
    }

    if (!results || results.length === 0) {
      alert('Please search first to find matches');
      return;
    }

    const confirmMessage = `Replace ${results.reduce((sum, r) => sum + r.matches.reduce((s, m) => s + m.count, 0), 0)} occurrences of "${findText}" with "${replaceText}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const updatedSegments = JSON.parse(JSON.stringify(segments)); // Deep clone
    
    results.forEach(result => {
      result.matches.forEach(match => {
        const pathParts = match.path.split('.');
        let obj = updatedSegments[result.segmentIndex];
        
        // Navigate to the parent object
        for (let i = 0; i < pathParts.length - 1; i++) {
          obj = obj[pathParts[i]];
        }
        
        // Replace the text
        const fieldName = pathParts[pathParts.length - 1];
        const regex = new RegExp(
          caseSensitive ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
          caseSensitive ? 'g' : 'gi'
        );
        obj[fieldName] = obj[fieldName].replace(regex, replaceText);
      });
    });
    
    onUpdate(updatedSegments);
    setResults(null);
    setFindText('');
    setReplaceText('');
    alert('Replace operation completed successfully!');
  };

  const getTotalMatches = () => {
    if (!results) return 0;
    return results.reduce((sum, r) => sum + r.matches.reduce((s, m) => s + m.count, 0), 0);
  };

  return (
    <div className="bulk-operations">
      <h3>Bulk Find & Replace</h3>
      
      <div className="bulk-form">
        <div className="bulk-inputs">
          <div className="input-group">
            <label>Find:</label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Text to search for..."
            />
          </div>
          
          <div className="input-group">
            <label>Replace with:</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
            />
          </div>
        </div>
        
        <div className="bulk-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            Case sensitive
          </label>
        </div>
        
        <div className="field-selector">
          <p>Search in fields:</p>
          <div className="field-checkboxes">
            {Object.entries(selectedFields).map(([field, checked]) => (
              <label key={field} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleFieldToggle(field)}
                />
                {field.replace(/_/g, ' ').charAt(0).toUpperCase() + field.replace(/_/g, ' ').slice(1)}
              </label>
            ))}
          </div>
        </div>
        
        <div className="bulk-actions">
          <button 
            className="search-btn"
            onClick={handleSearch}
            disabled={isSearching || !findText}
          >
            🔍 Search
          </button>
          <button 
            className="replace-btn"
            onClick={handleReplace}
            disabled={!results || results.length === 0}
          >
            ✏️ Replace All
          </button>
        </div>
      </div>
      
      {results && (
        <div className="search-results">
          <h4>Search Results</h4>
          <p className="results-summary">
            Found {getTotalMatches()} matches in {results.length} segments
          </p>
          
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <strong>Segment {result.segmentNumber}</strong>
                  <span className="match-count">{result.matches.reduce((s, m) => s + m.count, 0)} matches</span>
                </div>
                <div className="result-matches">
                  {result.matches.map((match, mIndex) => (
                    <div key={mIndex} className="match-item">
                      <span className="match-field">{match.path}:</span>
                      <span className="match-preview">
                        ...{match.value.substring(
                          Math.max(0, match.value.toLowerCase().indexOf(findText.toLowerCase()) - 20),
                          match.value.toLowerCase().indexOf(findText.toLowerCase()) + findText.length + 20
                        )}...
                      </span>
                      <span className="match-count-badge">{match.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkOperations;