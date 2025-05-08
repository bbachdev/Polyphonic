import { getArtists } from '@/util/db'
import { QUERY_KEY_ARTISTS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const useArtists = () => useQuery({
  queryKey: [QUERY_KEY_ARTISTS],
  queryFn: () => getArtists()
})