import { Library } from '@/types/Config'
import { getAlbumsById } from '@/util/db'
import { QUERY_KEY_MOST_RECENTLY_ADDED } from '@/util/query'
import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

export const useAddedAlbums = (libraries: Map<String, Library>) => useQuery({
  queryKey: [QUERY_KEY_MOST_RECENTLY_ADDED],
  queryFn: async () => {
    return await invoke('get_recently_added', { library: libraries.values().next().value })
    .then(async (albumIds: any) => {
      const albumListAlbums = await getAlbumsById(albumIds as string[])
      return albumListAlbums
    })
  }
})