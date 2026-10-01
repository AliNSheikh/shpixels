/**
 * Helper to extract a YouTube video ID from a URL, a plain ID, or legacy CMS
 * values. Public rendering must not throw if an older database row contains a
 * number/null/object instead of a string.
 */
export function extractYouTubeId(urlOrId: unknown): string {
  const trimmed = typeof urlOrId === 'string'
    ? urlOrId.trim()
    : urlOrId == null
      ? ''
      : String(urlOrId).trim();

  if (!trimmed) return '';

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch?.[1]) return shortMatch[1];

    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch?.[1]) return watchMatch[1];

    const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch?.[1]) return embedMatch[1];

    const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch?.[1]) return shortsMatch[1];

    const generalMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (generalMatch?.[1]) return generalMatch[1];
  } catch (err) {
    console.error('Error parsing YouTube URL:', err);
  }

  return trimmed;
}

export function getYouTubeThumbnailUrl(videoId: unknown, quality: 'maxres' | 'hq' | 'mq' = 'maxres'): string {
  const cleanId = extractYouTubeId(videoId);
  if (!cleanId) return '';

  if (quality === 'maxres') return `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`;
  if (quality === 'hq') return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
  return `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: unknown, autoplay = false): string {
  const cleanId = extractYouTubeId(videoId);
  if (!cleanId) return '';

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1'
  });
  if (autoplay) params.set('autoplay', '1');

  return `https://www.youtube.com/embed/${cleanId}?${params.toString()}`;
}
