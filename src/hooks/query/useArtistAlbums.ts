import { getAlbumsForArtist } from '@/util/db'
import { QUERY_ARTIST_ALBUMS } from '@/util/query'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

export const useArtistAlbums = (artistId: string | undefined) => useQuery({
  queryKey: [QUERY_ARTIST_ALBUMS, artistId],
  queryFn: () => {
    if(artistId === undefined) {
      return []
    }
    return getAlbumsForArtist(artistId)
  },
  placeholderData: keepPreviousData
})