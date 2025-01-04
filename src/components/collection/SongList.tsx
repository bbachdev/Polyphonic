import { ListInfo, Queue, Song } from '@/types/Music'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SongListProps {
  songs: Song[],
  listInfo: ListInfo | undefined,
  nowPlayingId: string | undefined
  onSongPlay: (queue: Queue) => void
}

export default function SongList({ songs, listInfo, nowPlayingId, onSongPlay, }: SongListProps) {
  function playSong(songId: string) {
    let currentSong = songs.findIndex(s => s.id === songId)
    let newQueue: Queue = { songs: songs, current_song: currentSong }
    onSongPlay(newQueue)
  }

  return (
    <div className={`w-full h-full flex flex-col`}>
      {listInfo && (
        <div className={`py-2 px-4 flex flex-col`}>
          <p className={`text-2xl`}>{listInfo.title}</p>
          <p className={`text-base`}>{listInfo.author}</p>
        </div>
      )}
      <ScrollArea className={`w-full`}>
        {songs.map((song, index) => (
          <div className={`p-2 cursor-pointer flex flex-row items-center ${song.id === nowPlayingId ? 'dark:bg-slate-700' : ''} dark:hover:bg-slate-700`} key={index} onClick={() => playSong(song.id)}>
            <span className={`mr-2`}>{song.track.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>
            <div className={`flex flex-col`}>
              <p className={`px-1 font-semibold text-base line-clamp-1 break-all`}>{song.title}</p>
              <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{song.artist_name}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}