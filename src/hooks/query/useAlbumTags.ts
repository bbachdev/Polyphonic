import { getTagsByAlbum } from '@/util/db'
import { QUERY_KEY_ALBUM_TAGS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const useAlbumTags = (tagId: string | undefined) => useQuery({
  queryKey: [QUERY_KEY_ALBUM_TAGS, tagId],
  queryFn: async () => {
    if (tagId === undefined) {
      return []
    }
    const albumTags = await getTagsByAlbum(tagId)
    return albumTags.map(tag => tag.tag_id)
  }
})