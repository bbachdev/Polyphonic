import { Queue, Song } from '@/types/Music'

interface SongListProps {
  songs: Song[]
  nowPlayingId: string | undefined
  onSongPlay: (queue: Queue) => void
}

export default function SongList({ songs, nowPlayingId, onSongPlay, }: SongListProps) {
  function playSong(songId: string) {
    let currentSong = songs.findIndex(s => s.id === songId)
    let newQueue: Queue = { songs: songs, current_song: currentSong }
    onSongPlay(newQueue)
  }

  return (
    <div className={`w-full h-dvh flex flex-col`}>
      <h1 className={`p-2`}>Song List</h1>
      <div className={`overflow-y-auto`}>
        {songs.map((song, index) => (
          <div className={`p-2 cursor-pointer ${song.id === nowPlayingId ? 'dark:bg-slate-700' : ''} dark:hover:bg-slate-700`} key={index} onClick={() => playSong(song.id)}>
            <div className={`flex flex-col`}>
              <p className={`px-1 font-semibold text-sm line-clamp-1 break-all`}>{song.title}</p>
              <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{song.artist_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}