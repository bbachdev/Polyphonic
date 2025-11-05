import { Playlist, ListView } from '@/types/Music'
import { MouseEvent, useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePlaylists } from '@/hooks/query/usePlaylists'
import ViewSwitcher from './ViewSwitcher'

interface PlaylistListProps {
  onPlaylistSelected: (playlistId: Playlist | undefined) => void
  onViewChange: (view: ListView) => void
  currentView: ListView
}

export default function PlaylistList( {onPlaylistSelected, onViewChange, currentView}: PlaylistListProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | undefined>(undefined)

  const { data: playlists, isSuccess: isPlaylistsSuccess } = usePlaylists()

  useEffect(() => {
    if (isPlaylistsSuccess && playlists.length > 0) {
      setSelectedPlaylist(playlists[0])
      onPlaylistSelected(playlists[0])
    }
  }, [isPlaylistsSuccess, playlists, onPlaylistSelected])

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
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
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