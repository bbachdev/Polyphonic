import { Playlist } from '@/types/Music'
import { getPlaylists } from '@/util/db'
import { MouseEvent, useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HiSwitchHorizontal } from 'react-icons/hi'

interface PlaylistListProps {
  onPlaylistSelected: (playlistId: Playlist | undefined) => void
  onPlaylistClicked: () => void
}

export default function PlaylistList( {onPlaylistSelected, onPlaylistClicked}: PlaylistListProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(undefined)

  useEffect(() => {
    async function getPlaylistList() {
      const playlists = await getPlaylists()
      setPlaylists(playlists)
    }
    getPlaylistList()
  }, [])

  function selectPlaylist(e: MouseEvent, playlist: Playlist) {
    //Ctrl + click
    if (e.ctrlKey) {
      setSelectedPlaylist(undefined)
    } else {
      //Regular click
      if (selectedPlaylist?.id !== playlist.id) {
        setSelectedPlaylist(playlists.find(a => a.id === playlist.id))
        onPlaylistSelected(playlist)
      }
    }
  }

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div className={`p-2 flex flex-row items-center`}>
        <h1>Playlists</h1>
        <button className={`ml-auto text-slate-400 underline`} onClick={onPlaylistClicked}>
          <span className={`flex flex-row gap-1 items-center`}><HiSwitchHorizontal />Artists</span>
        </button>
      </div>
      
      <ScrollArea className={`w-full`}>
        <ul>
          {playlists.map((playlist, index) => (
            <li className={`p-2 cursor-pointer ${(playlist.id === selectedPlaylist?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} key={index} onClick={(e) => selectPlaylist(e, playlist)}>{playlist.name}</li>
          ))}
        </ul>

      </ScrollArea>
    </div>
  )
}