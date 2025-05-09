import { getAlbumsByTag } from '@/util/db'
import { QUERY_KEY_TAGGED_ALBUMS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const useTaggedAlbums = (tagId: string | undefined) => useQuery({
  queryKey: [QUERY_KEY_TAGGED_ALBUMS, tagId],
  queryFn: () => {
    if (tagId === undefined) {
      return []
    }
    return getAlbumsByTag(tagId)
  }
})