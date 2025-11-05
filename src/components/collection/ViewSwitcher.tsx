import { ListView } from '@/types/Music'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

interface ViewSwitcherProps {
  currentView: ListView
  onViewChange: (view: ListView) => void
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`ml-auto text-slate-400 underline flex flex-row gap-1 items-center`}>
        View <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={currentView} onValueChange={(value) => onViewChange(value as ListView)}>
          <DropdownMenuRadioItem value="artist">Artists</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="playlist">Playlists</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="tag">Tags</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
