import { Playlist } from '@/types/Music'
import { MouseEvent, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HiSwitchHorizontal } from 'react-icons/hi'
import { usePlaylists } from '@/hooks/query/usePlaylists'

interface PlaylistListProps {
  onPlaylistSelected: (playlistId: Playlist | undefined) => void
  onTagClicked: () => void
}

export default function PlaylistList( {onPlaylistSelected, onTagClicked}: PlaylistListProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(undefined)

  const { data: playlists, isSuccess: isPlaylistsSuccess } = usePlaylists()

  // useEffect(() => {
  //   async function getPlaylistList() {
  //     const playlists = await getPlaylists()
  //     setPlaylists(playlists)
  //   }
  //   getPlaylistList()
  // }, [])

  function selectPlaylist(e: MouseEvent, playlist: Playlist) {
    //Ctrl + click
    if (e.ctrlKey) {
      setSelectedPlaylist(undefined)
    } else {
      //Regular click
      if (selectedPlaylist?.id !== playlist.id && isPlaylistsSuccess) {
        setSelectedPlaylist(playlists.find(a => a.id === playlist.id))
        onPlaylistSelected(playlist)
      }
    }
  }

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div className={`p-2 flex flex-row items-center`}>
        <h1>Playlists</h1>
        <button className={`ml-auto text-slate-400 underline`} onClick={onTagClicked}>
          <span className={`flex flex-row gap-1 items-center`}><HiSwitchHorizontal />Tags</span>
        </button>
      </div>
      
      <ScrollArea className={`w-full`}>
        <ul>
          {isPlaylistsSuccess && playlists.map((playlist, index) => (
            <li className={`p-2 cursor-pointer ${(playlist.id === selectedPlaylist?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} key={index} onClick={(e) => selectPlaylist(e, playlist)}>{playlist.name}</li>
          ))}
        </ul>

      </ScrollArea>
    </div>
  )
}