import { getSongsForAlbum } from '@/util/db'
import { QUERY_KEY_SONGS } from '@/util/query'
import { useQuery, useQueries } from '@tanstack/react-query'
import { Song, Album } from '@/types/Music'

// For fetching songs for a single album
export const useSongs = (albumId: string | undefined) => useQuery<Song[]>({
  queryKey: [QUERY_KEY_SONGS, albumId],
  queryFn: () => {
    if(albumId === undefined) {
      return []
    }
    return getSongsForAlbum(albumId)
  },
  enabled: !!albumId
})

// For fetching songs for multiple albums in parallel
export const useAlbumSongs = (albums: Album[]) => {

  const results = useQueries({
    queries: albums.map(album => ({
      queryKey: [QUERY_KEY_SONGS, album.id],
      queryFn: () => getSongsForAlbum(album.id),
      enabled: !!album.id
    }))
  })
  
  // Return both the results and success state
  const isAllSuccess = results.every(result => result.isSuccess)
  return {
    results,
    isAllSuccess
  }
}