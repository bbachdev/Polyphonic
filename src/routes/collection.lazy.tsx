import AlbumList from '@/components/collection/AlbumList';
import ArtistList from '@/components/collection/ArtistList';
import NowPlaying from '@/components/collection/NowPlaying';
import PlaylistList from '@/components/collection/PlaylistList';
import SongList from '@/components/collection/SongList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Spinner from '@/components/ui/spinner';
import { Config, Library } from '@/types/Config';
import { Album, ListInfo, Playlist, Queue, Song } from '@/types/Music';
import { getAlbumsForArtist, getSongsForAlbum, getSongsFromPlaylist } from '@/util/db';
import { library_modified } from '@/util/subsonic';
import { createLazyFileRoute } from '@tanstack/react-router'
import { invoke } from '@tauri-apps/api/core';
import { load } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'react';
import { FaGear } from "react-icons/fa6";

export const Route = createLazyFileRoute('/collection')({
  component: Collection,
})

function Collection() {
  const [libraries, setLibraries] = useState<Map<String, Library>>(new Map())
  const [albumList, setAlbumList] = useState<Album[]>([])
  const [songList, setSongList] = useState<Song[]>([])
  const [queue, setQueue] = useState<Queue>({ songs: [], current_song: -1 })
  const [nowPlayingId, setNowPlayingId] = useState<string | undefined>(undefined)
  const [selectedListInfo, setSelectedListInfo] = useState<ListInfo | undefined>(undefined)
  const [leftView, setLeftView] = useState<'artist' | 'playlist'>('artist')
  const [isScanning, setIsScanning] = useState<boolean>(false)

  async function getArtistAlbums(artistId: string | undefined) {
    if (artistId === undefined) {
      //TODO: Grab default list
      setAlbumList([])
    } else {
      const albums = await getAlbumsForArtist(artistId)
      setAlbumList(albums)
    }
  }

  async function getPlaylistSongs(playlist: Playlist | undefined) {
    if( playlist === undefined) {
      setSongList([])
    } else {
      if(libraries.has(playlist.library_id)) {
        const songs = await getSongsFromPlaylist(libraries.get(playlist.library_id)!, playlist.id)
        setSongList(songs)
      }
    }
  }

  async function getAlbumSongs(album: Album | undefined) {
    if (album === undefined) {
      setSongList([])
    } else {
      const songs = await getSongsForAlbum(album.id)
      setSelectedListInfo({ title: album.name, author: album.artist_name })
      setSongList(songs)
    }
  }

  async function playSong(newQueue: Queue) {
    setQueue(newQueue)
  }

  function toggleLeftView(view: 'artist' | 'playlist') {
    setSongList([])
    setLeftView(view)
  }

  useEffect(() => {
    async function getLibraries() {
      invoke('get_libraries')
        .then(async (libraries: any) => {
          const library_data: Library[] = libraries as Library[]
          const libraryMap = new Map<String, Library>()
          library_data.forEach(library => {
            libraryMap.set(library.id, library)
          })
          setLibraries(libraryMap)

          //Check if we need to sync
          //TODO: Support multiple libraries
          if (library_data.length > 0) {
            if(await library_modified(library_data[0]) == true) {
              console.log("Library modified")
            }else{
              console.log("Library not modified")
            }
          }


        }).catch(() => {
          console.log("Failed to get libraries")
        })
    }
    getLibraries()
  }, [])

  return (
    <div className={`w-full flex flex-col`}>
      <div className={`flex flex-row p-4 items-center border-b-2 border-slate-800 dark:border-slate-200`}>
        <div>
          <img src='/tauri.svg' className={`h-10 w-10`} />
        </div>
        <div className={`ml-auto`}>
          <button><FaGear className={`h-8 w-8`} /></button>
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
            <ArtistList onArtistSelected={getArtistAlbums} onPlaylistClicked={() =>toggleLeftView('playlist')} />
          )}
          { leftView === 'playlist' && (
            <PlaylistList onPlaylistSelected={getPlaylistSongs} onPlaylistClicked={() => toggleLeftView('artist')} />
          )}
        </ResizablePanel>
        { leftView === 'artist' && (
          <>
            <ResizableHandle className={`dark:bg-slate-200`} />
            <ResizablePanel defaultSize={58} minSize={30}>
              <AlbumList libraries={libraries} parentAlbums={albumList} onAlbumSelected={getAlbumSongs} />
            </ResizablePanel>
          </>   
        )}
        <ResizableHandle className={`dark:bg-slate-200`} />

        { leftView === 'playlist' && (
          <>
            <ResizablePanel defaultSize={58} minSize={30}>
            <SongList nowPlayingId={nowPlayingId} songs={songList} listInfo={selectedListInfo} onSongPlay={playSong} mode={'playlist'} />
            </ResizablePanel>
          </>
        )}
        { leftView === 'artist' && (
          <ResizablePanel defaultSize={22} minSize={20}>
            <SongList nowPlayingId={nowPlayingId} songs={songList} listInfo={selectedListInfo} onSongPlay={playSong} mode={'artist'} />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
      <NowPlaying newQueue={queue} libraries={libraries} onPlay={(song) => setNowPlayingId(song?.id)} />
    </div>
  )
}