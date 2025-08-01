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
import { useAlbumSongs } from '@/hooks/query/useSongs';
import { useLibraries } from '@/hooks/query/useLibraries';
import Settings from '@/components/settings/Settings';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_ARTIST_ALBUMS, QUERY_KEY_ARTISTS, QUERY_KEY_MOST_RECENTLY_ADDED, QUERY_KEY_MOST_RECENTLY_PLAYED } from '@/util/query';

export const Route = createLazyFileRoute('/collection')({
  component: Collection,
})

function Collection() {
  const queryClient = useQueryClient()
  
  const [overallPage, setOverallPage] = useState<'collection' | 'settings'>('collection')
  const [songList, setSongList] = useState<Song[]>([])
  //const [queue, setQueue] = useState<Queue>({ songs: [], current_song: -1 })
  const [nowPlayingId, setNowPlayingId] = useState<string | undefined>(undefined)
  const [selectedListInfo, setSelectedListInfo] = useState<Map<string, ListInfo>>(new Map<string, ListInfo>())
  const [leftView, setLeftView] = useState<ListView>(localStorage.getItem('leftView') as ListView || 'artist')
  const [isScanning, setIsScanning] = useState<boolean>(false)

  //Music Data
  const { data: libraries } = useLibraries()

  const [currentArtistId, setCurrentArtistId] = useState<string | undefined>(undefined)
  const { data: artistAlbums } = useArtistAlbums(currentArtistId)

  const [currentTagId, setcurrentTagId] = useState<string | undefined>(undefined)
  const { data: tagAlbums } = useTaggedAlbums(currentTagId)

  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | undefined>(undefined)
  const [playlistLibrary, setPlaylistLibrary] = useState<Library | undefined>(undefined)
  const { data: playlistSongs, isLoading: isPlaylistSongsLoading } = usePlaylistSongs(playlistLibrary, currentPlaylistId)

  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([])

  const { results: albumSongResults } = useAlbumSongs(selectedAlbums)
  const isAlbumSongsLoading = albumSongResults.some(result => result.isFetching)

  useEffect(() => {
    if(leftView === 'artist' || leftView === 'tag') {
      // Update when loading state changes 
      if (!isAlbumSongsLoading) {
        setSongList(albumSongResults.map(result => result.data || []).flat())
      }
    } else if(leftView === 'playlist') { 
      setSongList(playlistSongs || [])
    }
  }, [leftView, isAlbumSongsLoading])

  useEffect(() => {
    setSongList(songList.filter(song => selectedAlbums.some(album => album.id === song.album_id)))
    let listInfoMap = new Map<string, ListInfo>()
    if(selectedAlbums.length > 0) {
      selectedAlbums.forEach(album => {
        listInfoMap.set(album.id, {
          id: album.id,
          title: album.name,
          author: album.artist_name,
          year: album.year
        })
      })
    }
    setSelectedListInfo(listInfoMap)
  }, [selectedAlbums])

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

  function toggleLeftView(view: ListView) {
    setSongList([])
    setLeftView(view)
    //Save left view to local storage
    localStorage.setItem('leftView', view)
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
              queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ARTISTS, QUERY_ARTIST_ALBUMS] })
              queryClient.invalidateQueries({ queryKey: [QUERY_KEY_MOST_RECENTLY_PLAYED, QUERY_KEY_MOST_RECENTLY_ADDED] })
              setIsScanning(false)
            }).catch((e) => {
              console.log("==Error: ", e)
              console.log("Failed to sync")
            })
        }
      }
    }
    //Check if we need to sync
    syncLibraries()
  }, [libraries])

  return (
    <QueueContextProvider>
      <div className={`w-full flex flex-col`}>
        { overallPage === 'collection' && (
          <>   
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
                    <AlbumList libraries={libraries || new Map<String, Library>()} parentAlbums={((leftView === 'artist') ? artistAlbums : tagAlbums) || []} onAlbumsSelected={(albums) => setSelectedAlbums(albums)} view={leftView} />
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
          </>
        )}
        { overallPage === 'settings' && (
          <Settings onBackClicked={() => setOverallPage('collection')} />
        )}
        <div className={`mt-auto`}>
          <NowPlaying libraries={libraries || new Map<String, Library>()} onPlay={(song) => setNowPlayingId(song?.id)} />
        </div>
        
      </div>
    </QueueContextProvider>  
  )
}