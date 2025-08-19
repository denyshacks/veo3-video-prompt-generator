export async function generateNewCont(data) {
  console.log('[API Client NewCont] Calling /api/generate-new-cont with:', data);
  const response = await fetch('/api/generate-new-cont', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to generate new continuation segments');
  }
  const result = await response.json();
  return result;
} 