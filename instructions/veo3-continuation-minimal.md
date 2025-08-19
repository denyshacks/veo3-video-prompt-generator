# Veo 3 JSON Segment Guidelines - Continuation Minimal Edition

## JSON Structure for Continuation Segments

For continuation segments after the initial detailed segment, focus on voice and behavior consistency while minimizing redundant character descriptions.

```json
{
  "segment_info": {
    "segment_number": 2,
    "total_segments": 4,
    "duration": "00:08-00:16",
    "location": "living room",
    "continuity_markers": {
      "start_position": "Matching screenshot position exactly",
      "end_position": "Natural completion of gesture",
      "energy_level": "85% - maintaining enthusiasm",
      "gesture_flow": "Continuing from previous motion"
    }
  },
  
  "character_description": {
    "reference": "Continue from screenshot - same character appearance",
    "current_state": "[50+ words - Energy, expression, and position in this moment]",
    "voice_matching": "[150+ words - DETAILED voice consistency specs]",
    "behavioral_patterns": "[100+ words - Movement style, gesture patterns, energy expression]"
  },
  
  "scene_continuity": {
    "environment": "Same as established - living room setting",
    "camera_position": "[50+ words - Current angle and any movement]",
    "lighting_state": "Consistent with previous segment"
  },
  
  "action_timeline": {
    "dialogue": "[Exact words spoken in this 8-second segment]",
    "synchronized_actions": {
      "0:00-0:02": "Continuing gesture from screenshot position",
      "0:02-0:04": "Natural movement with dialogue rhythm",
      "0:04-0:06": "Expression changes matching vocal emphasis",
      "0:06-0:08": "Preparation for next transition"
    },
    "voice_continuity": {
      "technical_specs": "[Use exact specs from voice profile]",
      "emotional_tone": "[How voice reflects current content]",
      "pacing_rhythm": "[Natural speech flow and breathing]",
      "emphasis_patterns": "[Which words get stress and how]"
    },
    "behavioral_consistency": {
      "gesture_style": "[Natural vs. controlled, expansive vs. contained]",
      "facial_expressions": "[How emotions manifest in face]",
      "body_language": "[Posture and energy expression]",
      "movement_quality": "[Smooth, energetic, deliberate, etc.]"
    }
  }
}
```

## Key Focus Areas for Continuation Segments

### 1. Voice Matching (150+ words REQUIRED)
This is the MOST CRITICAL element. Include:
- **Exact Technical Specs**: Pitch range, speaking rate, tone qualities
- **Breathing Patterns**: Where natural breaths occur
- **Emphasis Style**: How key words are stressed
- **Emotional Inflections**: How feelings affect voice
- **Consistency Markers**: Unique voice qualities to maintain

### 2. Behavioral Patterns (100+ words)
Detailed description of:
- **Gesture Vocabulary**: Specific hand movements and patterns
- **Energy Expression**: How enthusiasm manifests physically
- **Facial Animation**: Typical expression changes
- **Movement Quality**: Smooth, quick, deliberate, flowing
- **Reaction Patterns**: How character responds to own words

### 3. Current State (50+ words)
Brief but specific:
- Current energy level (percentage)
- Facial expression in this moment
- Body position and gesture phase
- Emotional undertone

### 4. Minimal Physical Description
Simply reference:
- "Continue from screenshot appearance"
- "Same character as established"
- "Maintaining consistent look from previous segment"

## Voice Continuity Details

### Technical Specifications (MUST MATCH EXACTLY)
```json
"voice_technical": {
  "pitch_range": "[Exact Hz range from profile]",
  "speaking_rate": "[Exact wpm from profile]",
  "tone_qualities": "[Exact description from profile]",
  "breath_pattern": "[Natural pause points]",
  "regional_markers": "[Subtle accent notes]",
  "vocal_texture": "[Clear, warm, slightly raspy, etc.]"
}
```

### Emphasis Patterns
- Product names: Slight slow-down, clearer articulation
- Benefits: Rising energy, pitch up 5-10 Hz
- Emotional moments: Warmer tone, slight smile in voice
- Call-to-action: Confident, decisive tone

## Behavioral Consistency Framework

### Gesture Patterns
- **Hands**: Natural movement arcs, never robotic
- **Amplitude**: How big/small gestures are
- **Rhythm**: Matching speech cadence
- **Rest Positions**: Where hands return between gestures

### Energy Expression
- **Baseline**: Normal energy percentage
- **Peaks**: How excitement shows physically
- **Valleys**: Quieter moments still engaged
- **Transitions**: Smooth energy changes

### Facial Consistency
- **Micro-expressions**: Quick emotion flashes
- **Eye engagement**: Direct to camera connection
- **Smile variations**: Genuine vs. presentational
- **Brow movement**: Emphasis and reaction

## Transition Requirements

### From Screenshot
- Match EXACT position and expression
- Continue any mid-gesture movement
- Maintain energy level unless script requires change
- Voice picks up at same emotional tone

### To Next Segment
- Clear end position for next screenshot
- Natural completion of current thought
- Energy appropriate for upcoming content
- Gesture in neutral or transitional state

## Common Pitfalls to Avoid

1. **Over-describing appearance**: Don't repeat character details
2. **Vague voice specs**: Always use exact technical parameters
3. **Generic behaviors**: Be specific about gesture style
4. **Energy mismatches**: Keep consistent unless purposeful
5. **Robotic transitions**: Natural movement flows

## Quality Checklist for Continuation Segments

- [ ] Voice description is 150+ words with technical specs
- [ ] Behavioral patterns described in 100+ words
- [ ] Current state captures this moment (50+ words)
- [ ] Physical description minimized to reference only
- [ ] Voice continuity includes all technical parameters
- [ ] Behavioral consistency framework applied
- [ ] Transition from screenshot position matched
- [ ] Energy level percentage specified
- [ ] Gesture vocabulary maintained
- [ ] Natural speech rhythm preserved