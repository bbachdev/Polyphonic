import { Album } from '@/types/Music'
import { useState, MouseEvent, useEffect } from 'react'
import CoverArt from './CoverArt'
import { Library } from '@/types/Config'
import { invoke } from '@tauri-apps/api/core'
import { getAlbumsById } from '@/util/db'

interface AlbumListProps {
  parentAlbums: Album[],
  libraries: Map<String, Library>,
  onAlbumSelected: (albumId: Album | undefined) => void
}

export default function AlbumList({ parentAlbums, libraries, onAlbumSelected }: AlbumListProps) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | undefined>(undefined)

  useEffect(() => {
    async function getRecentlyPlayed() {
      //TODO: Don't hardcode 1st element
      console.log("Libraries", libraries)
      if (libraries.size > 0) {
        console.log("Library, ", libraries.values().next().value)
        const recentlyPlayed = await invoke('get_recently_played', { library: libraries.values().next().value })
          .then(async (albumIds: any) => {
            const albumListAlbums = await getAlbumsById(albumIds as string[])
            setAlbums(albumListAlbums)
            console.log("Album ids", albumIds)
            return albumIds
          })

        console.log("Recently played", recentlyPlayed)
      }

    }
    getRecentlyPlayed()
  }, [libraries])

  useEffect(() => {
    setAlbums(parentAlbums)
  }, [parentAlbums])

  function selectAlbum(e: MouseEvent, albumId: string) {
    //Ctrl + click
    if (e.ctrlKey) {
      setSelectedAlbum(undefined)
      onAlbumSelected(undefined)
    } else {
      //Regular click
      if (selectedAlbum?.id !== albumId) {
        let album = albums.find(a => a.id === albumId)
        setSelectedAlbum(album)
        onAlbumSelected(album)
      }
    }
  }

  return (
    <div className={`w-full h-dvh flex flex-col justify-center`}>
      <h1 className={`p-2`}>Album List</h1>
      <div className={`overflow-y-auto albumGrid text-center`}>
        {albums.map((album, index) => (
          <div className={`p-2 cursor-pointer ${(album.id === selectedAlbum?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} key={index} onClick={(e) => selectAlbum(e, album.id)}>
            <div className={`flex flex-col`}>
              <CoverArt src={album.cover_art + '.png'} fallbackSrc={album.cover_art + '.jpg'} alt={album.name} className={`h-32 w-32`} />
              <div className={`flex flex-col`}>
                <p className={`px-1 font-semibold text-sm line-clamp-1 break-all`}>{album.name}</p>
                <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{album.artist_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}