import { writeText } from '@tauri-apps/plugin-clipboard-manager';

interface ShareOptions {
  type: 'song' | 'album';
  title: string;
  artist: string;
  album?: string;
  year?: number;
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

export async function createShare(options: ShareOptions): Promise<ShareResponse> {
  const response = await fetch(`${SHARE_API_URL}/api/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Failed to create share: ${response.statusText}`);
  }

  return await response.json();
}

export async function shareToClipboard(options: ShareOptions): Promise<string> {
  const shareData = await createShare(options);

  // Use Tauri's clipboard API
  await writeText(shareData.url);

  return shareData.url;
}
