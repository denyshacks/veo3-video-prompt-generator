import React, { useState, useEffect } from 'react';
import './App.css';
import ScriptForm from './components/ScriptForm';
import ResultsDisplay from './components/ResultsDisplay';
import DownloadButton from './components/DownloadButton';
import VideoGenerator from './components/VideoGenerator';
import ErrorBoundary from './components/ErrorBoundary';
import ContinuationMode from './components/ContinuationMode';
import SegmentManager from './components/SegmentManager';
import BulkOperations from './components/BulkOperations';
import { generateSegments } from './api/client';
import ScriptFormPlus from './components/ScriptFormPlus';
import ResultsDisplayPlus from './components/ResultsDisplayPlus';
import DownloadButtonPlus from './components/DownloadButtonPlus';
import VideoGeneratorPlus from './components/VideoGeneratorPlus';
import { generateSegmentsPlus } from './api/clientPlus';
import NewContinuationMode from './components/NewContinuationMode';

function App() {
  useEffect(() => {
    console.log('App component mounted');
  }, []);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('standard'); // standard | continuation | standard-plus | new-cont
  const [showSegmentManager, setShowSegmentManager] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  const handleSubmit = async (formData) => {
    console.log('Form submitted with:', formData);
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = activeTab === 'standard-plus' ?
        await generateSegmentsPlus(formData) :
        await generateSegments(formData);
      console.log('Generation successful:', response);
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

  const handleSegmentUpdate = (updatedSegments) => {
    setResults({
      ...results,
      segments: updatedSegments,
      metadata: {
        ...results.metadata,
        totalSegments: updatedSegments.length,
        estimatedDuration: updatedSegments.length * 8
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="App">
      <header className="App-header">
        <h1>UGC Script Splitter for Veo 3</h1>
        <p>Transform your script into AI-ready video segments</p>
      </header>

      <main className="App-main">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveTab('standard')}
          >
            Standard Generation
          </button>
          <button 
            className={`tab-button ${activeTab === 'continuation' ? 'active' : ''}`}
            onClick={() => setActiveTab('continuation')}
          >
            Continuation Mode
          </button>
          <button 
            className={`tab-button ${activeTab === 'standard-plus' ? 'active' : ''}`}
            onClick={() => setActiveTab('standard-plus')}
          >
            Standard Plus
          </button>
          <button 
            className={`tab-button ${activeTab === 'new-cont' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-cont')}
          >
            New Cont. Mode
          </button>
        </div>

        {activeTab === 'standard' ? (
          <>
            <ScriptForm onSubmit={handleSubmit} loading={loading} />
            {error && (
              <div className="error-message">Error: {error}</div>
            )}
            {results && (
              <>
                <ResultsDisplay results={results} />
                <div className="action-buttons">
                  <button
                    className="toggle-manager-btn"
                    onClick={() => setShowSegmentManager(!showSegmentManager)}
                  >
                    {showSegmentManager ? '📋 Hide' : '🔧 Manage'} Segments
                  </button>
                  <button
                    className="toggle-bulk-btn"
                    onClick={() => setShowBulkOperations(!showBulkOperations)}
                  >
                    {showBulkOperations ? '🔍 Hide' : '🔍 Find'} & Replace
                  </button>
                </div>
                {showSegmentManager && (
                  <SegmentManager
                    segments={results.segments}
                    onUpdate={handleSegmentUpdate}
                  />
                )}
                {showBulkOperations && (
                  <BulkOperations
                    segments={results.segments}
                    onUpdate={handleSegmentUpdate}
                  />
                )}
                <DownloadButton segments={results.segments} metadata={results.metadata} />
                <VideoGenerator segments={results.segments} />
              </>
            )}
          </>
        ) : activeTab === 'continuation' ? (
          <ContinuationMode />
        ) : activeTab === 'standard-plus' ? (
          <>
            <ScriptFormPlus onSubmit={handleSubmit} loading={loading} />
            {error && (
              <div className="error-message">Error: {error}</div>
            )}
            {results && (
              <>
                <ResultsDisplayPlus results={results} />
                <div className="action-buttons">
                  <button
                    className="toggle-manager-btn"
                    onClick={() => setShowSegmentManager(!showSegmentManager)}
                  >
                    {showSegmentManager ? '📋 Hide' : '🔧 Manage'} Segments
                  </button>
                  <button
                    className="toggle-bulk-btn"
                    onClick={() => setShowBulkOperations(!showBulkOperations)}
                  >
                    {showBulkOperations ? '🔍 Hide' : '🔍 Find'} & Replace
                  </button>
                </div>
                {showSegmentManager && (
                  <SegmentManager
                    segments={results.segments}
                    onUpdate={handleSegmentUpdate}
                  />
                )}
                {showBulkOperations && (
                  <BulkOperations
                    segments={results.segments}
                    onUpdate={handleSegmentUpdate}
                  />
                )}
                <DownloadButtonPlus segments={results.segments} metadata={results.metadata} />
                <VideoGeneratorPlus segments={results.segments} />
              </>
            )}
          </>
        ) : (
          <NewContinuationMode />
        )}
      </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;