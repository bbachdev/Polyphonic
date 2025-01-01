import { Library } from '@/types/Config';
import { Song } from '@/types/Music'
import { stream } from '@/util/subsonic';
import { useEffect, useRef, useState } from 'react';
import { FaPlay, FaPause } from "react-icons/fa";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import CoverArt from './CoverArt';
import { convertFileSrc } from '@tauri-apps/api/core';

enum PlaybackState {
  Playing,
  Paused,
  Stopped,
}

interface NowPlayingProps {
  nowPlaying: Song | undefined,
  libraries: Map<String, Library>
}

export default function NowPlaying({ nowPlaying, libraries }: NowPlayingProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.Stopped)
  const [songData, setSongData] = useState<string[]>([])
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const volumeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getSongData() {
      console.log("getSongData")
      if (nowPlaying !== undefined) {
        console.log("Loading song", nowPlaying.title)
        await loadSong(nowPlaying)
      }
    }
    getSongData()
  }, [nowPlaying])

  async function loadSong(song: Song) {
    console.log("Cover art", song.cover_art)

    if (song !== undefined) {
      let audioData = await stream(song, libraries.get(song.library_id)!)
      if (audioData === undefined) {
        console.log("Failed to stream song")
        return
      }
      audioRef.current!.src = audioData
      audioRef.current?.load()
      audioRef.current?.play()
      setPlaybackState(PlaybackState.Playing)
    }
  }

  function pause() {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlaybackState(PlaybackState.Paused)
    }
  }

  function play() {
    if (audioRef.current) {
      audioRef.current.play()
      setPlaybackState(PlaybackState.Playing)
    }
  }

  return (
    <>
      <audio ref={audioRef}>
        <source />
        Your browser does not support the audio element.
      </audio>
      {nowPlaying && playbackState !== PlaybackState.Stopped && (
        <div className={`p-4 w-full flex flex-row border-t-2 border-slate-800 dark:border-slate-200 items-center`}>
          <div className={`flex flex-row gap-2 items-center`}>
            <CoverArt src={nowPlaying.cover_art} fallbackSrc={nowPlaying.cover_art + '.png'} alt={nowPlaying.title} className={`h-16 w-16`} />
            <div className={`flex flex-col`}>
              <p className={`px-1 font-semibold text-sm line-clamp-1 break-all`}>{nowPlaying.title}</p>
              <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{nowPlaying.artist_name}</p>
            </div>
          </div>
          <div className={`mx-auto flex flex-row`}>
            {playbackState === PlaybackState.Playing && (
              <button onClick={pause} className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
                <FaPause className={`h-8 w-8`} />
              </button>
            )}
            {playbackState === PlaybackState.Paused && (
              <button onClick={play} className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
                <FaPlay className={`h-8 w-8`} />
              </button>
            )}
            <button className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
              <MdSkipPrevious className={`h-8 w-8`} />
            </button>
            <button className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
              <MdSkipNext className={`h-8 w-8`} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}