import { Library } from '@/types/Config';
import { Song } from '@/types/Music'
import { scrobble, stream } from '@/util/subsonic';
import { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { FaPlayCircle, FaPauseCircle, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import CoverArt from '@/components/collection/CoverArt';
import Spinner from '@/components/ui/spinner';
import QueueContext from '@/contexts/QueueContext';
import QueueList from './QueueList';

//Make default lower volume for better UX
const DEFAULT_VOLUME = 65;
//Progress color for input range sliders
const PROGRESS_COLOR = '#588364';

enum PlaybackState {
  Playing,
  Paused,
  Stopped,
  Loading,
}

interface NowPlayingProps {
  libraries: Map<String, Library>
  onPlay: (song: Song | undefined) => void
  onAlbumClick: (song: Song) => void
}

export default function NowPlaying({ libraries, onPlay, onAlbumClick }: NowPlayingProps) {
  const { queue, currentSong, setCurrentSong, queueOrigin } = useContext(QueueContext)
  const [nowPlaying, setNowPlaying] = useState<Song | undefined>(undefined)
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.Stopped)

  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [savedVolume, setSavedVolume] = useState(DEFAULT_VOLUME) //Used when toggling mute

  //Seekbar
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  //Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const volumeRef = useRef<HTMLInputElement>(null);
  const songLoadingRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function getSongData() {
      if (currentSong !== undefined && currentSong !== -1) {
        await loadSong(queue[currentSong], currentSong)
      }
    }
    getSongData()
  }, [queueOrigin])

  async function loadSong(song: Song, indexToPlay: number) {
    if (song !== undefined && audioRef.current !== null) {

      //Cancel any pending song loads
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      //Create new pending song load (and store locally)
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      //Create new overall song loading ref (just increment "id")
      const songLoadingId = ++songLoadingRef.current

      setNowPlaying(song)
      onPlay(song)

      audioRef.current.pause()
      setPlaybackState(PlaybackState.Paused)

      //Reset seekbar
      if (progressRef.current) {
        progressRef.current.value = '0';
        progressRef.current.style.background = `linear-gradient(to right, ${PROGRESS_COLOR} ${progressRef.current.value}%, #ccc ${progressRef.current.value}%)`;
      }

      //Load current song (uses cache if already downloaded)
      setPlaybackState(PlaybackState.Loading)
      let audioData: string | undefined
      try {
        audioData = await stream(song, libraries.get(song.library_id)!)
      } catch(e: any) {
        if(e.name !== "AbortError") {
          console.log("Failed to stream song", e)
          return
        }
      }

      if(songLoadingId !== songLoadingRef.current) {
        return
      }

      if (audioData === undefined) {
        console.log("Failed to stream song")
        return
      }

      //Check if song load was cancelled
      if(songLoadingId !== songLoadingRef.current) {
        return
      }

      audioRef.current.src = audioData
      audioRef.current.load()
      let secondsDate = new Date(0)
      secondsDate.setSeconds(song.duration)
      var timestring = secondsDate.toISOString().slice(11, 19).replace(/^0+:(0+)?/, '')
      setDuration(timestring)
      audioRef.current.play()
      setPlaybackState(PlaybackState.Playing)

      //Scrobble song
      scrobble(song.id, libraries.get(song.library_id)!)

      //Pre-load nearby songs in the background (for smooth playback)
      preloadNearbySongs(indexToPlay, songLoadingId)
    }
  }

  async function preloadNearbySongs(indexToPlay: number, songLoadingId: number) {
    //Grab previous songs if possible
    if (indexToPlay > 0) {
      let previousTwo = Math.max(0, indexToPlay - 2)
      for (let i = previousTwo; i < indexToPlay; i++) {
        //Check if song load was cancelled
        if(songLoadingId !== songLoadingRef.current) {
          return
        }
        let song = queue[i]
        try {
          await stream(song, libraries.get(song.library_id)!)
        } catch(e) {
          console.log("Failed to preload song", e)
        }
      }
    }

    //Grab next songs if possible
    if (indexToPlay < queue.length - 1) {
      let nextTwo = Math.min(queue.length - 1, indexToPlay + 2)
      for (let i = indexToPlay + 1; i <= nextTwo; i++) {
        //Check if song load was cancelled
        if(songLoadingId !== songLoadingRef.current) {
          return
        }
        let song = queue[i]
        try {
          await stream(song, libraries.get(song.library_id)!)
        } catch(e) {
          console.log("Failed to preload song", e)
        }
      }
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

  async function nextSong() {
    if (audioRef.current) {
      if (currentSong && currentSong === queue.length - 1) {
        setPlaybackState(PlaybackState.Stopped)
        return
      } else {
        let nextSong = currentSong! + 1
        setCurrentSong(nextSong)
        await loadSong(queue[nextSong], nextSong)
      }
    }
  }

  async function previousSong() {
    if (audioRef.current) {
      if (currentSong === 0) {
        return
      } else {
        let previousSong = currentSong! - 1
        setCurrentSong(previousSong)
        await loadSong(queue[previousSong], previousSong)
      }
    }
  }

  async function playQueueFromBeginning() {
    if (audioRef.current) {
      setCurrentSong(0)
      await loadSong(queue[0], 0)
    }
  }

  /* Volume Related */
  const changeVolume = (newLevel: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newLevel / 100;
    setVolume(newLevel);
    if (newLevel === 0) {
      audioRef.current.muted = true;
    }
    else {
      audioRef.current.muted = false;
    }
    if (!volumeRef.current) return;
    volumeRef.current.value = newLevel.toString();
  }

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (audioRef.current.muted) {
      audioRef.current.muted = false;
      setVolume(savedVolume);
      if (!volumeRef.current) return;
      volumeRef.current.value = savedVolume.toString();
    }
    else {
      audioRef.current.muted = true;
      setSavedVolume(volume);
      setVolume(0);
      if (!volumeRef.current) return;
      volumeRef.current.value = '0';
    }
    volumeRef.current.style.background = `linear-gradient(to right, ${PROGRESS_COLOR} ${volumeRef.current.value}%, #ccc ${volumeRef.current.value}%)`;
  }

  /* Seek-Related */
  const updateTime = () => {
    if (!audioRef.current || !progressRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if(!isNaN(duration)) {
      const progressPercent = (currentTime / duration) * 100;
      progressRef.current.value = progressPercent.toString();
      progressRef.current.style.background = `linear-gradient(to right, ${PROGRESS_COLOR} ${progressRef.current.value}%, #ccc ${progressRef.current.value}%)`;
      //Update time strings
      setCurrentTime(`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`);
    }
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const percent = Number(e.target.value) / 100;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  }

  const updateProgress = (ref: RefObject<HTMLInputElement>) => {
    if (ref.current) {
      const sliderValue = Number(ref.current.value);
      ref.current.style.background = `linear-gradient(to right, ${PROGRESS_COLOR} ${sliderValue}%, #ccc ${sliderValue}%)`;
    }
  }

  function queueItemClicked(song: Song, index: number) {
    loadSong(song, index)
  }

  /* Queue-Related */
  //function queueItemClicked(index: number) {
    //Find song in queue
    //loadSong(queue.songs[index])
  //}

  //function adjustQueue(newQueue: Queue) {
    //setQueue(newQueue)
  //}

  return (
    <>
      <audio ref={audioRef} onTimeUpdate={updateTime} onEnded={() => nextSong()}>
        <source />
        Your browser does not support the audio element.
      </audio>
      {nowPlaying && (
        <div className={`flex flex-col w-full border-t-2 border-slate-800 dark:border-slate-200`}>
          <div className={'flex flex-row w-full'}>
            <span className={`text-sm text-slate-200 px-2`}>{currentTime}</span>
            <input className={'w-full cursor-pointer'} ref={progressRef} type="range" step={`any`} defaultValue={0} onChange={(e) => seek(e)} onInput={() => updateProgress(progressRef)} />
            <span className={`text-sm text-slate-200 mx-3`}>{duration}</span>
          </div>

          <div className={`p-4 w-full flex flex-row content-between items-center`}>
            <div className={`flex flex-row gap-2 items-center basis-0 grow`}>
              <div
                className={`h-16 w-16 relative ${playbackState !== PlaybackState.Loading ? 'cursor-pointer group' : 'cursor-default'}`}
                onClick={() => playbackState !== PlaybackState.Loading && onAlbumClick(nowPlaying)}
              >
                <CoverArt src={nowPlaying.cover_art} fallbackSrc={nowPlaying.cover_art + '.webp'} alt={nowPlaying.title} className={`h-16 w-16 ${playbackState !== PlaybackState.Loading ? 'group-hover:brightness-75' : ''} transition-all`} />
                {playbackState === PlaybackState.Loading && (
                  <div className={`absolute flex items-center justify-center top-0 left-0 h-16 w-16 bg-slate-200 dark:bg-slate-800/50`}>
                    <Spinner size={32} className={``} />
                  </div>
                )}
              </div>
              <div className={`flex flex-col`}>
                <p className={`px-1 font-semibold text-lg line-clamp-1 break-all`}>{nowPlaying.title}</p>
                <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{nowPlaying.artist_name}</p>
              </div>
            </div>
            <div className={`flex flex-row items-center gap-2`}>
              <button onClick={previousSong} className={`rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
                <MdSkipPrevious className={`h-10 w-10`} />
              </button>
              {(playbackState === PlaybackState.Playing || playbackState === PlaybackState.Loading) && (
                <button onClick={pause} className={`rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`} disabled={playbackState === PlaybackState.Loading}>
                  <FaPauseCircle className={`h-10 w-10`} />
                </button>
              )}
              {playbackState === PlaybackState.Paused && (
                <button onClick={play} className={`rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
                  <FaPlayCircle className={`h-10 w-10`} />
                </button>
              )}
              {playbackState === PlaybackState.Stopped && (
                <button onClick={playQueueFromBeginning} className={`rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
                  <FaPlayCircle className={`h-10 w-10`} />
                </button>
              )}
              <button onClick={nextSong} className={`rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
                <MdSkipNext className={`h-10 w-10`} />
              </button>
            </div>

            { /* Volume slider */}
            <div className={' basis-0 grow flex flex-row h-fit space-x-2 items-center'}>
              <div className={'ml-auto flex cursor-pointer w-fit hover:text-gray-400'}>
                {volume > 0 ?
                  <FaVolumeUp onClick={toggleMute} fontSize={'medium'} /> :
                  <FaVolumeMute onClick={toggleMute} fontSize={'medium'} />
                }
              </div>
              <div className={'flex'}>
                <input ref={volumeRef} type="range" defaultValue={volume} min={0} max={100} step={1} onChange={(e) => changeVolume(Number(e.target.value))} onInput={() => updateProgress(volumeRef)} />
              </div>
              <QueueList nowPlayingId={nowPlaying?.id} onPlaySong={queueItemClicked} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}