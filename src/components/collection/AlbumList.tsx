import { FaTag, FaPlay } from "react-icons/fa";
import { MdQueue } from "react-icons/md";
import { Album } from '@/types/Music'
import { useState, MouseEvent, useEffect } from 'react'
import CoverArt from './CoverArt'
import { Library, SortDirection, SortType } from '@/types/Config'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TagDialog from '@/components/collection/TagDialog';
import { useRecentAlbums } from '@/hooks/query/useRecentAlbums';
import { useAddedAlbums } from '@/hooks/query/useAddedAlbums';
import Spinner from '@/components/ui/spinner';
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface AlbumListProps {
  parentAlbums: Album[],
  libraries: Map<String, Library>,
  onAlbumsSelected: (albums: Album[]) => void,
  view: 'artist' | 'tag'
}

export default function AlbumList({ parentAlbums, libraries, onAlbumsSelected, view }: AlbumListProps) {
  const [albums, setAlbums] = useState<Album[]>([])

  //Sort
  const [sortType, setSortType] = useState<SortType>(SortType.RECENTLY_PLAYED)
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.DESC)

  //NEW
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([])

  //Tag-related
  const [albumContext, setAlbumContext] = useState<string[]>([])
  const [tagDialogOpen, setTagDialogOpen] = useState(false)

  const { data: recentlyPlayed, isSuccess: isRecentlyPlayedSuccess, isLoading: isRecentlyPlayedLoading } = useRecentAlbums(libraries)
  const { data: recentlyAdded } = useAddedAlbums(libraries)

  useEffect(() => {
    if(view === 'artist') {
      setAlbums(recentlyPlayed || [])
    }else {
      setAlbums([])
    }
  }, [recentlyPlayed, view])

  useEffect(() => {
    async function updateAlbumList() {
      if(parentAlbums && parentAlbums.length === 0 && isRecentlyPlayedSuccess) {
        //getRecentlyPlayed()
        if(sortType === SortType.RECENTLY_PLAYED) {
          setAlbums(recentlyPlayed)
        }else {
          setAlbums(recentlyAdded || [])
        }
      }else {
        setAlbums(parentAlbums)
      }
      setSelectedAlbums([])
    }
    updateAlbumList()
  }, [parentAlbums])

  //TODO: Eventually remove
  // function selectAlbum(e: MouseEvent, albumId: string) {
  //   //Ctrl + click
  //   if (e.ctrlKey) {
  //     setSelectedAlbum(undefined)
  //     onAlbumSelected(undefined)
  //   } else {
  //     //Regular click
  //     if (selectedAlbum?.id !== albumId) {
  //       let album = albums.find(a => a.id === albumId)
  //       setSelectedAlbum(album)
  //       onAlbumSelected(album)
  //     }
  //   }
  // }

  function handleAlbumSelect(e: MouseEvent, albumId: string) {
    let album = albums.find(a => a.id === albumId)
    if(album === undefined) {
      return
    }
    if(e.metaKey || e.ctrlKey) {
      //Check if album is already selected
      if(selectedAlbums.includes(album)) {
        let newAlbumList = selectedAlbums.filter(a => a.id !== albumId)
        setSelectedAlbums(newAlbumList)
        onAlbumsSelected(newAlbumList)
      }else {
        let newAlbumList = [...selectedAlbums, album]
        setSelectedAlbums(newAlbumList)
        onAlbumsSelected(newAlbumList)
      }
    }else{
      setSelectedAlbums([album])
      onAlbumsSelected([album])
    }

  }

  function openTagDialog(albumId: string) {
    if(selectedAlbums.length > 0) {
      setAlbumContext(selectedAlbums.map(a => a.id))
    }else{
      setAlbumContext([albumId])
    }
    
    setTagDialogOpen(true)
  }

  function closeTagDialog() {
    setAlbumContext([])
    setTagDialogOpen(false)
  }

  //TODO: Play album
  function playAlbumContext(albumId: string) {
    console.log("Playing album context: " + albumId)
  }

  //TODO: Add to queue
  function addToQueueContext(albumId: string) {
    console.log("Adding to queue context: " + albumId)
  }

  function toggleSortDirection() {
    setSortDirection(sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC)
    //Reverse list
    setAlbums(albums.reverse())
  }

  function switchSortType() {
    const newSortType = sortType === SortType.RECENTLY_PLAYED ? SortType.RECENTLY_ADDED : SortType.RECENTLY_PLAYED

    setSortType(newSortType)

    if(newSortType === SortType.RECENTLY_PLAYED) {
      setAlbums(recentlyPlayed || [])
    }else {
      setAlbums(recentlyAdded || [])
    }
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
        <div className={`flex flex-row`}>
          <h1 className={`p-2`}>Album List</h1>
          <div className={`ml-auto p-2 flex flex-row gap-2 items-center text-slate-400`}>
            {parentAlbums.length === 0 && (
              <>
                <p className={`underline cursor-pointer`} onClick={switchSortType}>
                  {sortType === SortType.RECENTLY_PLAYED ? 'Recently Played' : 'Recently Added'}
                </p>
                {sortDirection === SortDirection.ASC ? <FaArrowUp className={`cursor-pointer`} onClick={toggleSortDirection}/> : <FaArrowDown className={`cursor-pointer`} onClick={toggleSortDirection}/>}
              </>
            )}
          </div>
        </div>
        <ScrollArea className={`w-full overflow-hidden`}>
          <div className={`albumGrid text-center`}>
            {albums.map((album, index) => (
              <ContextMenu key={index} modal={false}>
                <ContextMenuTrigger>
                  <div className={`p-2 cursor-pointer ${(album.id === selectedAlbums.find(a => a.id === album.id)?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} onClick={(e) => handleAlbumSelect(e, album.id)}>
                    <div className={`flex flex-col`}>
                      <CoverArt src={album.cover_art} fallbackSrc={album.cover_art + '.webp'} alt={album.name} className={`h-32 w-32`} />
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
      <DialogTitle className={`sr-only`}>Set Tags</DialogTitle>
      <DialogContent aria-description="Set tags for selected albums">
        <TagDialog albumIds={albumContext} onClose={closeTagDialog} />
      </DialogContent>
    </Dialog>
  )
}