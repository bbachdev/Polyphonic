import { getSongsForAlbum } from '@/util/db'
import { QUERY_KEY_SONGS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const useSongs = (albumId: string | undefined) => useQuery({
  queryKey: [QUERY_KEY_SONGS, albumId],
  queryFn: () => {
    if(albumId === undefined) {
      return []
    }
    return getSongsForAlbum(albumId)
  }
})