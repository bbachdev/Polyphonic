import { FaTag, FaPlay } from "react-icons/fa";
import { MdQueue } from "react-icons/md";
import { Album } from '@/types/Music'
import { useState, MouseEvent, useEffect, useRef } from 'react'
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

  //Drag-to-select
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const albumRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const { data: recentlyPlayed, isSuccess: isRecentlyPlayedSuccess, isLoading: isRecentlyPlayedLoading } = useRecentAlbums(libraries)
  const { data: recentlyAdded } = useAddedAlbums(libraries)

  useEffect(() => {
    if(view === 'artist') {
      setAlbums(recentlyPlayed || [])
    }else {
      setAlbums(parentAlbums || [])
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
      setAlbumContext([])
    }
    updateAlbumList()
  }, [parentAlbums])

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
      if(!albumContext.includes(albumId)) {
        setAlbumContext([...albumContext, albumId])
      }
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

  // Drag-to-select handlers
  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement

    // Don't start drag if clicking on interactive elements
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'P' ||
      target.tagName === 'H1' ||
      target.tagName === 'IMG' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="menuitem"]') ||
      target.closest('svg') ||
      // Don't start drag when clicking on album cards
      (target.classList.contains('cursor-pointer') && !target.classList.contains('albumGrid'))
    ) {
      return
    }

    // Start drag from wrapper or album grid background
    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    if (wrapperRect) {
      setIsDragging(true)
      const scrollTop = containerRef.current?.scrollTop || 0
      setDragStart({ x: e.clientX - wrapperRect.left, y: e.clientY - wrapperRect.top + scrollTop })
      setDragEnd({ x: e.clientX - wrapperRect.left, y: e.clientY - wrapperRect.top + scrollTop })

      // Clear selection if not holding Ctrl/Cmd
      if (!e.metaKey && !e.ctrlKey) {
        setSelectedAlbums([])
        onAlbumsSelected([])
      }
    }
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!isDragging || !dragStart) return

    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    if (wrapperRect) {
      const scrollTop = containerRef.current?.scrollTop || 0
      setDragEnd({ x: e.clientX - wrapperRect.left, y: e.clientY - wrapperRect.top + scrollTop })

      // Calculate selection box bounds
      const selectionBox = {
        left: Math.min(dragStart.x, e.clientX - wrapperRect.left),
        right: Math.max(dragStart.x, e.clientX - wrapperRect.left),
        top: Math.min(dragStart.y, e.clientY - wrapperRect.top + scrollTop),
        bottom: Math.max(dragStart.y, e.clientY - wrapperRect.top + scrollTop)
      }

      // Find albums that intersect with selection box
      const newSelectedAlbums: Album[] = []
      albums.forEach(album => {
        const albumElement = albumRefs.current.get(album.id)
        if (albumElement && wrapperRef.current) {
          const albumRect = albumElement.getBoundingClientRect()
          const wrapperBounds = wrapperRef.current.getBoundingClientRect()
          const albumBox = {
            left: albumRect.left - wrapperBounds.left,
            right: albumRect.right - wrapperBounds.left,
            top: albumRect.top - wrapperBounds.top + scrollTop,
            bottom: albumRect.bottom - wrapperBounds.top + scrollTop
          }

          // Check for intersection
          if (!(albumBox.right < selectionBox.left ||
                albumBox.left > selectionBox.right ||
                albumBox.bottom < selectionBox.top ||
                albumBox.top > selectionBox.bottom)) {
            newSelectedAlbums.push(album)
          }
        }
      })

      setSelectedAlbums(newSelectedAlbums)
      onAlbumsSelected(newSelectedAlbums)
    }
  }

  function handleMouseUp() {
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  // Calculate selection box style
  const getSelectionBoxStyle = () => {
    if (!isDragging || !dragStart || !dragEnd) return { display: 'none' }

    const left = Math.min(dragStart.x, dragEnd.x)
    const top = Math.min(dragStart.y, dragEnd.y)
    const width = Math.abs(dragEnd.x - dragStart.x)
    const height = Math.abs(dragEnd.y - dragStart.y)

    return {
      position: 'absolute' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: '2px solid rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none' as const,
      zIndex: 1000
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
      <div
        ref={wrapperRef}
        className={`w-full h-full flex flex-col relative`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
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
          <div
            ref={containerRef}
            className={`albumGrid text-center`}
          >
            {albums.map((album, index) => (
              <ContextMenu key={index} modal={false}>
                <ContextMenuTrigger>
                  <div
                    ref={(el) => {
                      if (el) {
                        albumRefs.current.set(album.id, el)
                      } else {
                        albumRefs.current.delete(album.id)
                      }
                    }}
                    className={`p-2 cursor-pointer ${(album.id === selectedAlbums.find(a => a.id === album.id)?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`}
                    onClick={(e) => handleAlbumSelect(e, album.id)}
                  >
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
        {/* Selection box overlay */}
        <div style={getSelectionBoxStyle()} />
      </div>
      <DialogTitle className={`sr-only`}>Set Tags</DialogTitle>
      <DialogContent aria-description="Set tags for selected albums">
        <TagDialog albumIds={albumContext} onClose={closeTagDialog} />
      </DialogContent>
    </Dialog>
  )
}