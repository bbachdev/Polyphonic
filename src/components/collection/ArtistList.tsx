import { Artist } from '@/types/Music'
import { MouseEvent, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HiSwitchHorizontal } from "react-icons/hi";
import { useArtists } from '@/hooks/query/useArtists';

interface ArtistListProps {
  onArtistSelected: (artistId: string | undefined) => void
  onPlaylistClicked: () => void
}

export default function ArtistList({ onArtistSelected, onPlaylistClicked }: ArtistListProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | undefined>(undefined)

  const { data: artists, isSuccess: isArtistsSuccess } = useArtists()

  function selectArtist(e: MouseEvent, artistId: string) {
    //Ctrl + click
    if (e.ctrlKey) {
      setSelectedArtist(undefined)
      onArtistSelected(undefined)
    } else {
      //Regular click
      if (selectedArtist?.id !== artistId) {
        if(isArtistsSuccess) {
          setSelectedArtist(artists.find(a => a.id === artistId))
          onArtistSelected(artistId)
        }
      }
    }
  }

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div className={`p-2 flex flex-row items-center`}>
        <h1>Artists</h1>
        <button className={`ml-auto text-slate-400 underline`} onClick={onPlaylistClicked}>
          <span className={`flex flex-row gap-1 items-center`}><HiSwitchHorizontal />Playlists</span>
        </button>
      </div>
      
      <ScrollArea className={`w-full overflow-hidden`}>
        <ul>
          {isArtistsSuccess && artists.map((artist, index) => (
            <li className={`p-2 cursor-pointer ${(artist.id === selectedArtist?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} key={index} onClick={(e) => selectArtist(e, artist.id)}>{artist.name}</li>
          ))}
        </ul>

      </ScrollArea>
    </div>
  )
}