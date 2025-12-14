import { writeText } from '@tauri-apps/plugin-clipboard-manager';

interface ShareOptions {
  type: 'song' | 'album';
  title: string;
  artist: string;
  album?: string;
  year?: number;
  coverArtUrl?: string;
}

interface ShareResponse {
  id: string;
  url: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  deezerUrl?: string;
  youtubeMusicUrl?: string;
  tidalUrl?: string;
  coverArtUrl?: string;
}

const SHARE_API_URL = import.meta.env.VITE_SHARE_API_URL || 'http://localhost:7636';
const SHARE_API_KEY = import.meta.env.VITE_SHARE_API_KEY;

/**
 * Converts an image URL to a base64 data URI
 */
async function imageUrlToBase64(imageUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.statusText}`);
      return undefined;
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Error converting image to base64:', error);
    return undefined;
  }
}

export async function createShare(options: ShareOptions): Promise<ShareResponse> {
  // Validate API key is configured
  if (!SHARE_API_KEY) {
    throw new Error(
      'Share API key is not configured. Please set VITE_SHARE_API_KEY in your .env file.'
    );
  }

  let coverArtBase64: string | undefined;

  // Convert cover art URL to base64 if provided
  if (options.coverArtUrl) {
    coverArtBase64 = await imageUrlToBase64(options.coverArtUrl);
  }

  const response = await fetch(`${SHARE_API_URL}/api/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': SHARE_API_KEY,
    },
    body: JSON.stringify({
      type: options.type,
      title: options.title,
      artist: options.artist,
      album: options.album,
      year: options.year,
      coverArtBase64,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Failed to create share: ${errorText}`);
  }

  return await response.json();
}

export async function shareToClipboard(options: ShareOptions): Promise<string> {
  const shareData = await createShare(options);

  // Use Tauri's clipboard API
  await writeText(shareData.url);

  return shareData.url;
}
