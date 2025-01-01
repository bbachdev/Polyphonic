import { Artist } from '@/types/Music'
import { getArtists } from '@/util/db'
import { MouseEvent, useEffect, useState } from 'react'

interface ArtistListProps {
  onArtistSelected: (artistId: string | undefined) => void
}

export default function ArtistList({ onArtistSelected }: ArtistListProps) {
  const [artists, setArtists] = useState<Artist[]>([])
  const [selectedArtist, setSelectedArtist] = useState<Artist | undefined>(undefined)

  useEffect(() => {
    async function getArtistList() {
      const artists = await getArtists()
      setArtists(artists)
    }
    getArtistList()
  }, [])

  function selectArtist(e: MouseEvent, artistId: string) {
    //Ctrl + click
    if (e.ctrlKey) {
      setSelectedArtist(undefined)
      onArtistSelected(undefined)
    } else {
      //Regular click
      if (selectedArtist?.id !== artistId) {
        setSelectedArtist(artists.find(a => a.id === artistId))
        onArtistSelected(artistId)
      }
    }
  }

  return (
    <div className={`w-full h-dvh flex flex-col`}>
      <h1 className={`p-2`}>Artist List</h1>
      <ul className={`overflow-y-auto`}>
        {artists.map((artist, index) => (
          <li className={`p-2 cursor-pointer ${(artist.id === selectedArtist?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} key={index} onClick={(e) => selectArtist(e, artist.id)}>{artist.name}</li>
        ))}
      </ul>
    </div>
  )
}