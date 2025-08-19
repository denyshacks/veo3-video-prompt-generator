export async function generateSegmentsPlus(data) {
  console.log('[API Client Plus] Calling /api/generate-plus with:', data);
  const response = await fetch('/api/generate-plus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  console.log('[API Client Plus] Response status:', response.status);
  if (!response.ok) {
    const error = await response.json();
    console.error('[API Client Plus] Error response:', error);
    throw new Error(error.message || 'Failed to generate segments (plus)');
  }
  const result = await response.json();
  console.log('[API Client Plus] Success response:', result);
  return result;
}

export async function downloadSegmentsPlus(segments) {
  console.log('[API Client Plus] Downloading segments:', segments.length);
  const response = await fetch('/api/download-plus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments }),
  });
  if (!response.ok) {
    console.error('[API Client Plus] Download failed:', response.status);
    throw new Error('Failed to download segments (plus)');
  }
  console.log('[API Client Plus] Download successful');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'veo3-segments-plus.zip';
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function generateVideosPlus(segments) {
  console.log('[API Client Plus] Generating videos for segments:', segments.length);
  const response = await fetch('/api/generate-videos-plus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments }),
  });
  console.log('[API Client Plus] Video generation response status:', response.status);
  if (!response.ok) {
    const error = await response.json();
    console.error('[API Client Plus] Video generation error:', error);
    throw new Error(error.message || 'Failed to generate videos (plus)');
  }
  const result = await response.json();
  console.log('[API Client Plus] Video generation success:', result);
  return result;
} 