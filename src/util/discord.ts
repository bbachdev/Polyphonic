import { Song } from '@/types/Music';
import { Client } from "discord-rpc";

const clientId = process.env.DISCORD_APPLICATION_ID

const rpc = new Client({
  transport: "ipc"
})

export async function setDiscordActivity(song: Song) {
  if(!clientId || !rpc) {
    return
  }

  try {
    await rpc.setActivity({
      details: song.title,
      state: song.artist_name,
      startTimestamp: new Date(),
      endTimestamp: new Date(Date.now() + song.duration),
    })
  }catch(e){
    console.error(e)
  }
}
