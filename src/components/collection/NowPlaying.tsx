import { Song } from '@/types/Music'
import { FaPlay, FaPause } from "react-icons/fa";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";

interface NowPlayingProps {
  nowPlaying: Song
}

export default function NowPlaying({ nowPlaying }: NowPlayingProps) {

  function pause() {

  }

  return (
    <div className={`w-full flex flex-row`}>
      <div className={`flex flex-col`}>
        <p className={`px-1 font-semibold text-sm line-clamp-1 break-all`}>{nowPlaying.title}</p>
        <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{nowPlaying.artist_name}</p>
      </div>
      <div className={`mx-auto flex flex-row`}>
        <button className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
          <FaPlay className={`h-8 w-8`} />
        </button>
        <button className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
          <FaPause className={`h-8 w-8`} />
        </button>
        <button className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
          <MdSkipPrevious className={`h-8 w-8`} />
        </button>
        <button className={`h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700`}>
          <MdSkipNext className={`h-8 w-8`} />
        </button>
      </div>
      <audio id="now-playing" src={nowPlaying.path} controls />
    </div>
  )
}