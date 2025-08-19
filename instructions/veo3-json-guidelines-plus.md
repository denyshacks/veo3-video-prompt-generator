# Veo 3 JSON Segment Guidelines (Standard Plus)

This is the Standard Plus copy of the standard guidelines. You can safely modify this file without affecting the original standard generation.

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

Refer to the original `veo3-json-guidelines.md` for full field-level requirements. Modify this Plus version to introduce additional constraints or features unique to Standard Plus. 