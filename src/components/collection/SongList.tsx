import { ListInfo, Song } from '@/types/Music'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FaCompactDisc } from "react-icons/fa";
import CoverArt from '@/components/collection/CoverArt';
import QueueContext from '@/contexts/QueueContext';
import { useContext } from 'react';

interface SongListProps {
  songs: Song[],
  listInfo: Map<string, ListInfo>,
  nowPlayingId: string | undefined
  mode: 'artist' | 'playlist'
}

export default function SongList({ songs, listInfo, nowPlayingId, mode}: SongListProps) {
  const { setQueue, setCurrentSong, setQueueOrigin } = useContext(QueueContext)

  function playSong(songId: string) {

    let currentSong = songs.findIndex(s => s.id === songId)
    console.log("Current song: ", currentSong)
    setQueue(songs)
    setCurrentSong(currentSong)
    setQueueOrigin(Date.now())
  }

  return (
    <div className={`w-full h-full flex flex-col`}>
      <ScrollArea className={`w-full overflow-hidden`}>
        {songs.map((song, index) => (
          <div key={song.id} className={`flex flex-col`}>
            {mode === 'artist' && (index === 0 || listInfo.get(songs[index-1].album_id)?.id !== listInfo.get(song.album_id)?.id) && (
              <div className={`py-2 px-4 flex flex-col`}>
                <p className={`text-2xl`}>{listInfo.get(song.album_id)?.title}</p>
                <p className={`mt-1 text-base`}>{listInfo.get(song.album_id)?.author} {listInfo.get(song.album_id)?.year ? `- (${listInfo.get(song.album_id)?.year})` : ''}</p>
              </div>
            )}
            {songs[index-1] && song.disc_number !== songs[index-1].disc_number && (
              <div className={`py-4 px-2 flex flex-row items-center gap-3`}><FaCompactDisc size={16}/>Disc {song.disc_number}</div>
            )}
            <div className={`p-2 cursor-pointer flex flex-row items-center ${song.id === nowPlayingId ? 'dark:bg-slate-700' : ''} dark:hover:bg-slate-700`} key={index} onClick={() => playSong(song.id)}>
              { mode === 'artist' && song.track !== 0 && (
                <span className={`mr-2`}>{song.track.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>
              )}
              { mode === 'artist' && song.track == 0 && (
                <span className={`mr-3`}>--</span>
              )}
              { mode === 'playlist' && (
                <CoverArt src={song.cover_art} fallbackSrc={song.cover_art + '.webp'} alt={song.title} className={`h-16 w-16`}></CoverArt>
              )}
              <div className={`flex flex-col`}>
                <p className={`px-1 font-semibold text-base line-clamp-1 break-all`}>{song.title}</p>
                <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{song.artist_name}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}