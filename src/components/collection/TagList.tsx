import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag, ListView } from '@/types/Music';
import { getTags } from '@/util/db';
import { MouseEvent, useEffect, useState } from 'react';
import ViewSwitcher from './ViewSwitcher'

interface TagListProps {
  onTagSelected: (tagId: string | undefined) => void
  onViewChange: (view: ListView) => void
  currentView: ListView
}

export default function TagList( { onTagSelected, onViewChange, currentView }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined)

  //TODO: Get out of useEffect
  useEffect(() => {
    async function getTagList() {
      const tags = await getTags()
      setTags(tags)
      if(tags.length > 0) {
        setSelectedTag(tags[0])
        onTagSelected(tags[0].id)
      }
    }
    getTagList()
  }, [])

  function selectTag(e: MouseEvent, tag: Tag) {
    //Ctrl + click
    if (e.ctrlKey) {
      setSelectedTag(undefined)
    } else {
      //Regular click
      if (selectedTag?.id !== tag.id) {
        setSelectedTag(tags.find(a => a.id === tag.id))
        onTagSelected(tag.id)
      }
    }
  }

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div className={`p-2 flex flex-row items-center`}>
        <h1>Tags</h1>
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
      </div>
      
      <ScrollArea className={`w-full overflow-hidden`}>
        <ul>
          {tags.map((tag, index) => (
            <li className={`p-2 cursor-pointer ${(tag.id === selectedTag?.id) ? 'bg-slate-700' : 'dark:hover:bg-slate-700'}`} key={index} onClick={(e) => selectTag(e, tag)}>{tag.name}</li>
          ))}
        </ul>

      </ScrollArea>
    </div>
  )
}