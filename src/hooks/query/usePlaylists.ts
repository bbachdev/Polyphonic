import { getPlaylists } from '@/util/db'
import { QUERY_KEY_PLAYLISTS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const usePlaylists = () => useQuery({
  queryKey: [QUERY_KEY_PLAYLISTS],
  queryFn: () => getPlaylists()
})