import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface TagDialogProps {
  albumId: string | undefined
  onClose: () => void
}

export default function TagDialog( { albumId, onClose }: TagDialogProps) {

  async function saveTags() {
    console.log("Saving tags")
    //TODO: Save to DB
    console.log("Album ID", albumId)
    
    onClose()
  }

  return (
    <div className={`dark:text-white`}>
      <h2 className={`text-2xl mb-4`}>Set Tags</h2>
      <p>Use an existing tag, or create a new one:</p>

      <DialogFooter className={`mt-4 flex flex-row items-center`}>
          <div className={`ml-auto flex flex-row`}>
            <Button variant={'outline'} className={`mr-2`} onClick={onClose}>Cancel</Button>
            <Button className={`ml-auto`} onClick={saveTags}>Confirm</Button>
          </div>
        </DialogFooter>
    </div>
  )
}