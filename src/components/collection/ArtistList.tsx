import { ListView } from '@/types/Music'
import { MouseEvent } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useArtists } from '@/hooks/query/useArtists';
import ViewSwitcher from './ViewSwitcher'

interface ArtistListProps {
  onArtistSelected: (artistId: string | undefined) => void
  onViewChange: (view: ListView) => void
  currentView: ListView
  selectedArtistId: string | undefined
}

export default function ArtistList({ onArtistSelected, onViewChange, currentView, selectedArtistId }: ArtistListProps) {
  const { data: artists, isSuccess: isArtistsSuccess } = useArtists()

  function selectArtist(e: MouseEvent, artistId: string) {
    //Ctrl + click
    if (e.ctrlKey) {
      onArtistSelected(undefined)
    } else {
      //Regular click
      if (selectedArtistId !== artistId) {
        if(isArtistsSuccess) {
          onArtistSelected(artistId)
        }
      }
    }
  }

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div className={`p-2 flex flex-row items-center`}>
        <h1>Artists</h1>
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
      </div>
      
      <ScrollArea className={`w-full overflow-hidden`}>
        <ul>
          {isArtistsSuccess && artists.map((artist, index) => (
            <li className={`p-2 cursor-pointer ${(artist.id === selectedArtistId) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} key={index} onClick={(e) => selectArtist(e, artist.id)}>{artist.name}</li>
          ))}
        </ul>

      </ScrollArea>
    </div>
  )
}