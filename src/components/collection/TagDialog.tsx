import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAlbumTags } from '@/hooks/query/useAlbumTags';
import { useTags } from '@/hooks/query/useTags';
import { createAlbumTags, createTags } from '@/util/db';
import { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_ALBUM_TAGS } from '@/util/query';

interface TagDialogProps {
  albumIds: string[]
  onClose: () => void
}

export default function TagDialog( { albumIds, onClose }: TagDialogProps) {
  const queryClient = useQueryClient()
  const [newTagName, setNewTagName] = useState<string>('')
  const [newTags, setNewTags] = useState<string[]>([])

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const albumTags = useAlbumTags(albumIds)
  const allSuccess = albumTags.every(result => result.isSuccess);
  const { data: tags } = useTags()

  useEffect(() => {
    if(allSuccess === true) {
      console.log("Album Tags: ", albumIds)
      const allTagIds = albumTags
      .map(queryResult => queryResult.data || [])
      .flat();
      setSelectedTags([...new Set(allTagIds)]);
    }
  }, [allSuccess])

  async function saveTags() {
    //Create new tags
    await createTags(newTags)

    //Set tags on album
    await createAlbumTags(albumIds, selectedTags)

    //Invalidate keys
    await Promise.all(albumIds.map(albumId => 
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ALBUM_TAGS, albumId] })
    ))
    
    onClose()
  }

  function onTagSelect(tagId: string) {
    setOpen(false)
    setSelectedTags(selectedTags.concat([tagId]))
  }

  function onTagRemove(tagId: string) {
    setSelectedTags(selectedTags.filter(t => t !== tagId))
    setNewTags(newTags.filter(t => t !== tagId))
  }

  function onNewTagCreate() {
    console.log("Creating new tag: " + newTagName)
    if(!selectedTags.includes(newTagName)) {
      setNewTags(newTags.concat([newTagName]))
      onTagSelect(newTagName)
    }
  }

  return (
    <div className={`flex flex-col dark:text-white`}>
      <h2 className={`text-2xl mb-4`}>Set Tags</h2>
      <Command>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <CommandInput value={newTagName} onValueChange={setNewTagName} placeholder={`Search for or enter a new tag name...`} onKeyUp={() => setOpen(true)}></CommandInput>
          </PopoverTrigger>
          <PopoverContent className={`p-0 w-[var(--radix-popover-trigger-width)]`} onOpenAutoFocus={(e) => e.preventDefault()}>
            <CommandGroup>
            {tags?.map(tag => (
              <CommandItem className={`cusror-pointer`} key={tag.id} onSelect={() => onTagSelect(tag.id)}>{tag.name}</CommandItem>
            ))}
          </CommandGroup>
          <CommandItem forceMount onSelect={onNewTagCreate}><FaPlus className={`h-4 w-4`} />Create Tag</CommandItem>
          </PopoverContent>
        </Popover> 
      </Command>
      { selectedTags.length > 0 && (
        <div className={`mt-4 flex flex-row flex-wrap gap-2 items-center`}>
          <span className={`text-sm text-slate-500 dark:text-slate-400`}>Selected Tags:</span>
          {selectedTags.map((tag) => (
            <Badge  key={tag} className={`flex flex-row gap-1 items-center`} onClick={() => onTagRemove(tag)}><FaXmark/>{tag}</Badge>
          ))}
        </div>
      )}

      <DialogFooter className={`mt-4 flex flex-row items-center`}>
          <div className={`ml-auto flex flex-row`}>
            <Button variant={'outline'} className={`mr-2`} onClick={onClose}>Cancel</Button>
            <Button className={`ml-auto`} onClick={saveTags}>Confirm</Button>
          </div>
        </DialogFooter>
    </div>
  )
}