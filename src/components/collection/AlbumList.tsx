import { FaTag, FaPlay } from "react-icons/fa";
import { MdQueue } from "react-icons/md";
import { Album } from '@/types/Music'
import { useState, MouseEvent, useEffect } from 'react'
import CoverArt from './CoverArt'
import { Library } from '@/types/Config'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import TagDialog from '@/components/collection/TagDialog';
import { useRecentAlbums } from '@/hooks/query/useRecentAlbums';
import Spinner from '@/components/ui/spinner';

interface AlbumListProps {
  parentAlbums: Album[],
  libraries: Map<String, Library>,
  onAlbumSelected: (albumId: Album | undefined) => void
}

export default function AlbumList({ parentAlbums, libraries, onAlbumSelected }: AlbumListProps) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | undefined>(undefined)

  //Tag-related
  const [albumContext, setAlbumContext] = useState<string | undefined>(undefined)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)

  const { data: recentlyPlayed, isSuccess: isRecentlyPlayedSuccess, isLoading: isRecentlyPlayedLoading } = useRecentAlbums(libraries)

  useEffect(() => {
    setAlbums(recentlyPlayed || [])
  }, [recentlyPlayed])

  useEffect(() => {
    async function updateAlbumList() {
      if(parentAlbums && parentAlbums.length === 0 && isRecentlyPlayedSuccess) {
        //getRecentlyPlayed()
        setAlbums(recentlyPlayed)
      }else {
        setAlbums(parentAlbums)
      }
    }
    updateAlbumList()
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

  function openTagDialog(albumId: string) {
    setAlbumContext(albumId)
  }

  function closeTagDialog() {
    setAlbumContext(undefined)
    setTagDialogOpen(false)
  }

  //TODO: Play album
  function playAlbumContext(albumId: string) {
    console.log("Playing album context")
  }

  //TODO: Add to queue
  function addToQueueContext(albumId: string) {
    console.log("Adding to queue context")
  }

  if(isRecentlyPlayedLoading) {
    return <div className={`w-full h-full flex flex-col`}>
      <h1 className={`p-2`}>Album List</h1>
      <div className={`w-full h-full flex flex-col`}>
        <div className={`w-full h-full flex flex-col`}>
          <Spinner size={86} className={`m-auto`} />
        </div>
      </div>
    </div>
  }

  return (
    <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
      <div className={`w-full h-full flex flex-col`}>
        <h1 className={`p-2`}>Album List</h1>
        <ScrollArea className={`w-full overflow-hidden`}>
          <div className={`albumGrid text-center`}>
            {albums.map((album, index) => (
              <ContextMenu key={index} modal={false}>
                <ContextMenuTrigger>
                  <div className={`p-2 cursor-pointer ${(album.id === selectedAlbum?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} onClick={(e) => selectAlbum(e, album.id)}>
                    <div className={`flex flex-col`}>
                      <CoverArt src={album.cover_art + '.png'} fallbackSrc={album.cover_art + '.jpg'} alt={album.name} className={`h-32 w-32`} />
                      <div className={`flex flex-col`}>
                        <p className={`px-1 font-semibold text-sm line-clamp-1 break-all`}>{album.name}</p>
                        <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{album.artist_name}</p>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem className={`flex gap-2 items-center`} onClick={() => playAlbumContext(album.id)}><FaPlay/>Play Album</ContextMenuItem>
                  <ContextMenuItem className={`flex gap-2 items-center`} onClick={() => addToQueueContext(album.id)}><MdQueue/>Add to Queue</ContextMenuItem>
                  <DialogTrigger asChild>
                    <ContextMenuItem className={`flex gap-2 items-center`} onClick={() => openTagDialog(album.id)}><FaTag/> Set Tags</ContextMenuItem>
                  </DialogTrigger>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </ScrollArea>
      </div>
      <DialogContent >
        <TagDialog albumId={albumContext} onClose={closeTagDialog} />
      </DialogContent>
    </Dialog>
  )
}