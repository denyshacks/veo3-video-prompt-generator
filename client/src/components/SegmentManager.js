import React, { useState, useEffect } from 'react';

function SegmentManager({ segments, onUpdate }) {
  const [localSegments, setLocalSegments] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    setLocalSegments(segments || []);
  }, [segments]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newSegments = [...localSegments];
    const draggedSegment = newSegments[draggedIndex];
    
    // Remove dragged segment
    newSegments.splice(draggedIndex, 1);
    
    // Insert at new position
    const adjustedDropIndex = dropIndex > draggedIndex ? dropIndex - 1 : dropIndex;
    newSegments.splice(adjustedDropIndex, 0, draggedSegment);
    
    // Update segment numbers
    const updatedSegments = newSegments.map((segment, index) => ({
      ...segment,
      segment_info: {
        ...segment.segment_info,
        segment_number: index + 1
      }
    }));
    
    setLocalSegments(updatedSegments);
    onUpdate(updatedSegments);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDuplicate = (index) => {
    const newSegments = [...localSegments];
    const segmentToDuplicate = { ...newSegments[index] };
    
    // Insert duplicate after the original
    newSegments.splice(index + 1, 0, segmentToDuplicate);
    
    // Update segment numbers
    const updatedSegments = newSegments.map((segment, idx) => ({
      ...segment,
      segment_info: {
        ...segment.segment_info,
        segment_number: idx + 1,
        total_segments: newSegments.length
      }
    }));
    
    setLocalSegments(updatedSegments);
    onUpdate(updatedSegments);
  };

  const handleDelete = (index) => {
    if (!window.confirm(`Delete segment ${index + 1}?`)) {
      return;
    }

    const newSegments = localSegments.filter((_, idx) => idx !== index);
    
    // Update segment numbers
    const updatedSegments = newSegments.map((segment, idx) => ({
      ...segment,
      segment_info: {
        ...segment.segment_info,
        segment_number: idx + 1,
        total_segments: newSegments.length
      }
    }));
    
    setLocalSegments(updatedSegments);
    onUpdate(updatedSegments);
  };

  const handleInsert = (index, position) => {
    const newSegment = {
      segment_info: {
        segment_number: index + 1,
        duration: "00:00-00:08",
        location: localSegments[index]?.segment_info?.location || "living room"
      },
      character_description: {
        physical: localSegments[0]?.character_description?.physical || "[Add physical description]",
        clothing: localSegments[0]?.character_description?.clothing || "[Add clothing description]",
        current_state: "[Add current state]",
        voice_matching: "[Add voice matching]"
      },
      scene_continuity: {
        environment: localSegments[0]?.scene_continuity?.environment || "[Add environment]",
        camera_position: "[Add camera position]"
      },
      action_timeline: {
        dialogue: "[Add dialogue here]",
        synchronized_actions: "[Add actions]"
      }
    };

    const newSegments = [...localSegments];
    const insertIndex = position === 'before' ? index : index + 1;
    newSegments.splice(insertIndex, 0, newSegment);
    
    // Update segment numbers
    const updatedSegments = newSegments.map((segment, idx) => ({
      ...segment,
      segment_info: {
        ...segment.segment_info,
        segment_number: idx + 1,
        total_segments: newSegments.length
      }
    }));
    
    setLocalSegments(updatedSegments);
    onUpdate(updatedSegments);
  };

  return (
    <div className="segment-manager">
      <div className="segment-manager-header">
        <h3>Segment Manager</h3>
        <p>Drag and drop to reorder segments, or use the action buttons to modify</p>
      </div>
      
      <div className="segment-list">
        {localSegments.map((segment, index) => (
          <div
            key={`segment-${index}`}
            className={`segment-item ${
              draggedIndex === index ? 'dragging' : ''
            } ${
              dragOverIndex === index ? 'drag-over' : ''
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={() => setDragOverIndex(null)}
          >
            <div className="segment-item-content">
              <div className="segment-item-header">
                <span className="segment-number">#{index + 1}</span>
                <span className="segment-location">
                  {segment.segment_info?.location || 'Unknown'}
                </span>
              </div>
              
              <div className="segment-item-dialogue">
                {segment.action_timeline?.dialogue 
                  ? `"${segment.action_timeline.dialogue.substring(0, 60)}${
                      segment.action_timeline.dialogue.length > 60 ? '...' : ''
                    }"`
                  : '[No dialogue]'}
              </div>
              
              <div className="segment-item-stats">
                <span>
                  {segment.action_timeline?.dialogue?.split(/\s+/).length || 0} words
                </span>
                <span>•</span>
                <span>{segment.segment_info?.duration || '8 seconds'}</span>
              </div>
            </div>
            
            <div className="segment-item-actions">
              <button
                className="segment-action-btn insert-before"
                onClick={() => handleInsert(index, 'before')}
                title="Insert segment before"
              >
                ⬆️
              </button>
              <button
                className="segment-action-btn duplicate"
                onClick={() => handleDuplicate(index)}
                title="Duplicate segment"
              >
                📋
              </button>
              <button
                className="segment-action-btn delete"
                onClick={() => handleDelete(index)}
                title="Delete segment"
              >
                🗑️
              </button>
              <button
                className="segment-action-btn insert-after"
                onClick={() => handleInsert(index, 'after')}
                title="Insert segment after"
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="segment-manager-footer">
        <p>Total segments: {localSegments.length}</p>
        <p>Estimated duration: {localSegments.length * 8} seconds</p>
      </div>
    </div>
  );
}

export default SegmentManager;