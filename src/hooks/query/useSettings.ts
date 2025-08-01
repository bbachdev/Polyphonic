import { Config, SortDirection, SortType } from "@/types/Config"
import { QUERY_KEY_SETTINGS } from "@/util/query"
import { useQuery } from "@tanstack/react-query"
import { load } from "@tauri-apps/plugin-store"

export const useSettings = () => useQuery({
  queryKey: [QUERY_KEY_SETTINGS],
  queryFn: async () => {
    const config = await load('config.json', { autoSave: false })

    let settings: Partial<Config> = {
        discord_rp: (await config.get<{value: boolean}>('discord_rp'))?.value || false,
        albumSortDefault: (await config.get<{value: {sortType: SortType, direction: SortDirection}}>('albumSortDefault'))?.value || { sortType: SortType.ALPHABETICAL, direction: SortDirection.ASC },
        albumSortArtist: (await config.get<{value: {sortType: SortType, direction: SortDirection}}>('albumSortArtist'))?.value || { sortType: SortType.ALPHABETICAL, direction: SortDirection.ASC }
    }
    
    return settings
  }
})