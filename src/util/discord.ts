import { Song } from '@/types/Music';
import { DiscordSDK } from "@discord/embedded-app-sdk";

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID

// Instantiate the SDK
const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

setupDiscordSdk().then(() => {
  console.log("Discord SDK is ready");
});

export async function setupDiscordSdk() {
  await discordSdk.ready();
}

export async function authorize() {
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "rpc.activities.write"
    ],
  });

  console.log("Code", code);
}

export async function setActivityStatus(song: Song) {
  await discordSdk.commands.setActivity({
    activity: { 
      type: 2,
      details: song.title,
      state: song.artist_name,
      assets: {
        large_image: song.cover_art,
        large_text: 'Listening to a track',
      }
    }
  });
}