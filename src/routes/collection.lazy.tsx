import AlbumList from '@/components/collection/AlbumList';
import ArtistList from '@/components/collection/ArtistList';
import NowPlaying from '@/components/collection/NowPlaying';
import PlaylistList from '@/components/collection/PlaylistList';
import SongList from '@/components/collection/SongList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Spinner from '@/components/ui/spinner';
import { Library } from '@/types/Config';
import { Album, ListInfo, ListView, Playlist, Song } from '@/types/Music';
import { library_modified } from '@/util/subsonic';
import { createLazyFileRoute } from '@tanstack/react-router'
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import { FaGear } from "react-icons/fa6";

import { QueueContextProvider } from '@/contexts/QueueContext';
import TagList from '@/components/collection/TagList';
import { useArtistAlbums } from '@/hooks/query/useArtistAlbums';
import { useTaggedAlbums } from '@/hooks/query/useTaggedAlbums';
import { usePlaylistSongs } from '@/hooks/query/usePlaylistSongs';
import { useSongs } from '@/hooks/query/useSongs';
import { useLibraries } from '@/hooks/query/useLibraries';
import Settings from '@/components/settings/Settings';

export const Route = createLazyFileRoute('/collection')({
  component: Collection,
})

function Collection() {
  const [overallPage, setOverallPage] = useState<'collection' | 'settings'>('collection')
  const [songList, setSongList] = useState<Song[]>([])
  //const [queue, setQueue] = useState<Queue>({ songs: [], current_song: -1 })
  const [nowPlayingId, setNowPlayingId] = useState<string | undefined>(undefined)
  const [selectedListInfo, setSelectedListInfo] = useState<ListInfo | undefined>(undefined)
  const [leftView, setLeftView] = useState<ListView>('artist')
  const [isScanning, setIsScanning] = useState<boolean>(false)

  //Music Data
  const { data: libraries } = useLibraries()

  const [currentArtistId, setCurrentArtistId] = useState<string | undefined>(undefined)
  const { data: artistAlbums } = useArtistAlbums(currentArtistId)

  const [currentTagId, setcurrentTagId] = useState<string | undefined>(undefined)
  const { data: tagAlbums, isLoading: isTagAlbumsLoading } = useTaggedAlbums(currentTagId)

  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | undefined>(undefined)
  const [playlistLibrary, setPlaylistLibrary] = useState<Library | undefined>(undefined)
  const { data: playlistSongs, isLoading: isPlaylistSongsLoading } = usePlaylistSongs(playlistLibrary, currentPlaylistId)

  const [currentAlbumId, setCurrentAlbumId] = useState<string | undefined>(undefined)
  const { data: albumSongs, isLoading: isAlbumSongsLoading } = useSongs(currentAlbumId)

  useEffect(() => {
    if(leftView === 'artist' || leftView === 'tag') {
      setSongList(albumSongs || [])
    }else if(leftView === 'playlist') { 
      setSongList(playlistSongs || [])
    }
  }, [playlistSongs, albumSongs, leftView])

  async function getPlaylistSongs(playlist: Playlist | undefined) {
    if( playlist === undefined) {
      setSongList([])
    } else {
      if(libraries && libraries.has(playlist.library_id)) {
        setCurrentPlaylistId(playlist.id)
        setPlaylistLibrary((libraries.get(playlist.library_id)))
      }
    }
  }

  async function getAlbumSongs(album: Album | undefined) {
    if (album === undefined) {
      setSongList([])
    } else {
      setCurrentAlbumId(album.id)
      setSelectedListInfo({ title: album.name, author: album.artist_name })
    }
  }

  function toggleLeftView(view: ListView) {
    setSongList([])
    setLeftView(view)
  }

  useEffect(() => {
    async function syncLibraries() {
      //Check if we need to sync
      if (libraries && libraries.size > 0) {
        const library_data = Array.from(libraries.values())
        if(await library_modified(library_data) === true) {
          setIsScanning(true)
          await invoke('sync_collection', { libraries: library_data })
            .then(() => {
              console.log("Synced")
              setIsScanning(false)
            }).catch((e) => {
              console.log("==Error: ", e)
              console.log("Failed to sync")
            })
        }else{
          console.log("Library not modified")
        }
      }
    }
    //Check if we need to sync
    //TODO: Renable after dev
    //syncLibraries()
  }, [libraries])

  return (
    <QueueContextProvider>
      { overallPage === 'collection' && (
        <div className={`w-full flex flex-col`}>
          <div className={`flex flex-row p-4 items-center border-b-2 border-slate-800 dark:border-slate-200`}>
            <div>
              <img src='/tauri.svg' className={`h-10 w-10`} />
            </div>
            <div className={`ml-auto`}>
              <button onClick={() => setOverallPage('settings')}><FaGear className={`h-8 w-8`} /></button>
            </div>
          </div>
          { isScanning && (
            <div className={`w-full py-1 flex flex-row items-center justify-center gap-2 bg-slate-900`}>
              <Spinner size={16} className={`mt-1`} />
              <span>Syncing Collection...</span>
            </div>
          )}
          <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel defaultSize={20} minSize={15}>
              { leftView === 'artist' && (
                <ArtistList onArtistSelected={(artistId) => setCurrentArtistId(artistId)} onPlaylistClicked={() =>toggleLeftView('playlist')} />
              )}
              { leftView === 'playlist' && (
                <PlaylistList onPlaylistSelected={getPlaylistSongs} onTagClicked={() => toggleLeftView('tag')} />
              )}
              { leftView === 'tag' && (
                <TagList onTagSelected={(tagId) => setcurrentTagId(tagId)} onArtistClicked={() => toggleLeftView('artist')} />
              )}
            </ResizablePanel>
            { (leftView === 'artist' || leftView === 'tag') && (
              <>
                <ResizableHandle className={`dark:bg-slate-200`} />
                <ResizablePanel defaultSize={58} minSize={30}>
                  <AlbumList libraries={libraries || new Map<String, Library>()} parentAlbums={((leftView === 'artist') ? artistAlbums : tagAlbums) || []} onAlbumSelected={getAlbumSongs} view={leftView} />
                </ResizablePanel>
              </>   
            )}
            <ResizableHandle className={`dark:bg-slate-200`} />

            { leftView === 'playlist' && (
              <>
                <ResizablePanel defaultSize={58} minSize={30}>
                <SongList nowPlayingId={nowPlayingId} songs={(!isPlaylistSongsLoading && !isAlbumSongsLoading) ? songList : []} listInfo={selectedListInfo} mode={'playlist'} />
                </ResizablePanel>
              </>
            )}
            { (leftView === 'artist' || leftView === 'tag') && (
              <ResizablePanel defaultSize={22} minSize={20}>
                <SongList nowPlayingId={nowPlayingId} songs={(!isPlaylistSongsLoading && !isAlbumSongsLoading) ? songList : []} listInfo={selectedListInfo} mode={'artist'} />
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
          <NowPlaying libraries={libraries || new Map<String, Library>()} onPlay={(song) => setNowPlayingId(song?.id)} />
        </div>
      )}
      { overallPage === 'settings' && (
        <Settings onBackClicked={() => setOverallPage('collection')} />
      )}
    </QueueContextProvider>
    
  )
}