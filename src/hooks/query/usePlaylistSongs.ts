import { Library } from '@/types/Config'
import { getSongsFromPlaylist } from '@/util/db'
import { QUERY_KEY_PLAYLIST_SONGS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const usePlaylistSongs = (library: Library | undefined, playlistId: string | undefined) => useQuery({
  queryKey: [QUERY_KEY_PLAYLIST_SONGS, library?.id, playlistId],
  queryFn: () => {
    if(library === undefined || playlistId === undefined) {
      return []
    }
    return getSongsFromPlaylist(library, playlistId)
  }
})