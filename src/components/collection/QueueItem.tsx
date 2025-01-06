import { Song } from '@/types/Music'
import { MdDeleteForever, MdDragIndicator } from "react-icons/md";
import { CgLoadbarSound } from 'react-icons/cg'
import CoverArt from '@/components/collection/CoverArt';

interface QueueItemProps {
  song: Song,
  index: number,
  current_index: number,
  onQueueItemClick: (songId: string) => void
  onQueueItemDelete: (index: number) => void
}

export default function QueueItem({ song, index, current_index, onQueueItemClick, onQueueItemDelete }: QueueItemProps) {
  return (
    <button className={`p-2 cursor-pointer flex flex-row items-center ${index === current_index ? 'dark:bg-slate-700' : ''} dark:hover:bg-slate-700`} key={index} onClick={() =>onQueueItemClick(song.id)}>
      <MdDragIndicator className={`h-6 w-6 mr-2`} />
      <CoverArt src={song.cover_art} fallbackSrc={song.cover_art + '.png'} alt={song.title} className={`h-12 w-12`} />
      <div className={`flex flex-col`}>
        <p className={`px-1 font-semibold text-base line-clamp-1 break-all`}>{song.title}</p>
        <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{song.artist_name}</p>
      </div>
      <div className={`ml-auto`}>
        { index == current_index && <CgLoadbarSound className={`h-6 w-6`} /> }
        { index !== current_index && <MdDeleteForever className={`h-6 w-6`} onClick={() => onQueueItemDelete(index)} /> }
      </div>
    </button>
  )
}