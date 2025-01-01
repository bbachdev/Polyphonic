import { Song } from '@/types/Music'

interface SongListProps {
  songs: Song[]
  onSongPlay: (songId: string) => void
}

export default function SongList({ songs, onSongPlay }: SongListProps) {
  return (
    <div className={`w-full h-dvh flex flex-col`}>
      <h1 className={`p-2`}>Song List</h1>
      <div className={`overflow-y-auto`}>
        {songs.map((song, index) => (
          <div className={`p-2 cursor-pointer`} key={index} onClick={() => onSongPlay(song.id)}>
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