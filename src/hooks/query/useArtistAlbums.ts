import { getAlbumsForArtist } from '@/util/db'
import { QUERY_ARTIST_ALBUMS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const useArtistAlbums = (artistId: string) => useQuery({
  queryKey: [QUERY_ARTIST_ALBUMS, artistId],
  queryFn: () => getAlbumsForArtist(artistId)
})