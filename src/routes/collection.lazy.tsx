import AlbumList from '@/components/collection/AlbumList';
import ArtistList from '@/components/collection/ArtistList';
import SongList from '@/components/collection/SongList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Config } from '@/types/Config';
import { Album, Song } from '@/types/Music';
import { getAlbumsForArtist, getSongsForAlbum } from '@/util/db';
import { createLazyFileRoute } from '@tanstack/react-router'
import { load } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'react';
import { FaGear } from "react-icons/fa6";

export const Route = createLazyFileRoute('/collection')({
  component: Collection,
})

function Collection() {
  const [albumList, setAlbumList] = useState<Album[]>([])
  const [songList, setSongList] = useState<Song[]>([])

  async function getArtistAlbums(artistId: string | undefined) {
    console.log("Selected artist", artistId)
    if (artistId === undefined) {
      //TODO: Grab default list
      setAlbumList([])
    } else {
      const albums = await getAlbumsForArtist(artistId)
      setAlbumList(albums)
    }
  }

  async function getAlbumSongs(albumId: string | undefined) {
    console.log("Selected album", albumId)
    if (albumId === undefined) {
      setSongList([])
    } else {
      const songs = await getSongsForAlbum(albumId)
      setSongList(songs)
    }
  }

  async function playSong(songId: string) {
    console.log("Play song", songId)
  }

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
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={20} minSize={15}>
          <ArtistList onArtistSelected={getArtistAlbums} />
        </ResizablePanel>
        <ResizableHandle className={`dark:bg-slate-200`} />
        <ResizablePanel defaultSize={60} minSize={30}>
          <AlbumList albums={albumList} onAlbumSelected={getAlbumSongs} />
        </ResizablePanel>
        <ResizableHandle className={`dark:bg-slate-200`} />
        <ResizablePanel defaultSize={20} minSize={20}>
          <SongList songs={songList} onSongPlay={playSong} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}