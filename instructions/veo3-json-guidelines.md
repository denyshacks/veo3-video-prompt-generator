# Veo 3 JSON Segment Guidelines

## JSON Structure for Each 8-Second Segment

Each segment must follow this exact JSON structure with detailed descriptions totaling 300+ words minimum.

```json
{
  "segment_info": {
    "segment_number": 1,
    "total_segments": 4,
    "location": "living room",
    "overlap_instructions": "Character position at end matches next segment start"
  },
  
  "character_description": {
    "physical": "[100+ words - EXACT same base description across all segments]",
    "clothing": "[100+ words - EXACT same outfit details across all segments]",
    "current_state": "[50+ words - Specific to this moment: expression, energy, position]",
    "voice_matching": "[50+ words - Inflection for these specific lines]"
  },
  
  "scene_continuity": {
    "environment": "[150+ words - Specific room description for this location]",
    "camera_position": "[Specific angle and framing for this segment]",
    "camera_movement": "[Static, slow push, orbit, or dynamic based on style]",
    "lighting_state": "[Lighting based on time of day and location]",
    "props_in_frame": "[What's visible in this shot]",
    "background_elements": "[Any background life or activity if enabled]"
  },
  
  "action_timeline": {
    "dialogue": "[Exact words spoken in this 8-second segment]",
    "synchronized_actions": "[Beat-by-beat actions matching dialogue timing]",
    "product_interactions": "[Specific product handling in this segment]",
    "location_transition": "[Movement between rooms if applicable]",
    "transition_prep": "[How segment ends to match next segment start]"
  }
}
```

## Field Requirements and Guidelines

### 1. Segment Info
- `segment_number`: Sequential number (1, 2, 3, etc.)
- `total_segments`: Total count of segments for the complete ad
- `overlap_instructions`: Specific instructions for seamless editing between segments

### 2. Character Description (300+ words total)

#### Physical (100+ words minimum)
Must include:
- Face shape and features
- Hair color, style, texture, and length
- Eye color and shape
- Skin tone and texture
- Height and build
- Age indicators
- Distinguishing features
- Micro-expressions and mannerisms
- Posture and body language
- Energy level and movement style

#### Clothing (100+ words minimum)
Must include:
- Every visible garment with specific details
- Colors with exact shades (e.g., "navy blue", not just "blue")
- Fabric types and textures
- Fit description (loose, fitted, tailored)
- Brand indicators or style markers
- Accessories (jewelry, watches, etc.)
- Shoes if visible
- Clothing condition (new, worn, pressed, casual)
- How clothes move with the character

#### Current State (50+ words minimum)
Specific to this segment:
- Facial expression at this moment
- Body position and posture
- Energy level for these lines
- Emotional state
- Where they're looking
- Hand positions
- Overall demeanor

#### Voice Matching (50+ words minimum)
Must include:
- Tone for these specific lines
- Speaking pace (words per minute)
- Pitch variations
- Emphasis on key words
- Breathing patterns
- Accent or regional markers
- Vocal texture (smooth, raspy, etc.)
- Inflection patterns

### 3. Scene Continuity

#### Environment (150+ words minimum)
Must be IDENTICAL across all segments:
- Room type and dimensions
- Wall colors with specific names/codes
- Flooring material and color
- Furniture placement
- Window/door positions
- Architectural details
- Decor items and placement
- Overall style (modern, traditional, etc.)
- Fixed elements that never change

#### Camera Position
Specific to this segment:
- Shot type (close-up, medium, wide)
- Camera angle (eye-level, slight above, etc.)
- Camera movement (static, slow zoom, pan)
- Framing details
- Focus points

#### Lighting State
- Primary light source and direction
- Shadow positions
- Time of day consistency
- Any practical lights visible
- Overall brightness/mood

#### Props in Frame
- All visible objects
- Product placement
- Background elements
- Items character interacts with

### 4. Action Timeline

#### Dialogue
- Exact words spoken in this 8-second segment
- Include pauses and emphasis
- Natural break points

#### Synchronized Actions
- Actions that match dialogue timing
- Gesture descriptions
- Product handling
- Movement patterns
- Facial expression changes

#### Product Interactions
- How product is held/displayed
- Demonstration actions
- Product visibility
- Key feature highlights

#### Transition Prep
- Exact position at segment end
- Expression at cut point
- Product/prop positions
- Instructions for next segment start

## Consistency Requirements

### Must Remain IDENTICAL Across All Segments:
1. Character physical description (word-for-word)
2. Clothing description (word-for-word)
3. Environment description (word-for-word)
4. Base lighting setup
5. Character's core voice characteristics

### Can Vary Between Segments:
1. Current state (expression, energy)
2. Camera position and movement
3. Specific vocal inflections for lines
4. Props in frame (based on camera angle)
5. Character position in space

## Quality Checklist for Each JSON:
- [ ] Total character description is 300+ words
- [ ] Physical description matches previous segments exactly
- [ ] Clothing description matches previous segments exactly
- [ ] Environment description matches previous segments exactly
- [ ] Dialogue fits within 8-second timing
- [ ] Actions are synchronized with dialogue
- [ ] Transition instructions are clear
- [ ] All required fields are populated
- [ ] Voice characteristics maintain consistency

## Example Timing Breakdown:
- 0:00-0:02 - Opening line with gesture
- 0:02-0:04 - Product pickup/display
- 0:04-0:06 - Key benefit statement
- 0:06-0:08 - Transition to next segment

## Special Instructions by Segment Type:

### Opening Segment (Segment 1):
- Start mid-action or with hook
- Establish character energy
- Show environment clearly
- Set the tone immediately

### Middle Segments:
- Peak product interaction
- Emotional high points
- Clear demonstrations
- Maintain energy flow

### Closing Segment:
- Strong call-to-action
- Memorable final position
- Product in hero position
- Energy that drives action