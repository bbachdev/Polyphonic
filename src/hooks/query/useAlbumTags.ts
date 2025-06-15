import { getTagsByAlbum } from '@/util/db'
import { QUERY_KEY_ALBUM_TAGS } from '@/util/query'
import { useQueries, useQuery } from '@tanstack/react-query'

export const useSingleAlbumTag = (tagId: string | undefined) => useQuery({
  queryKey: [QUERY_KEY_ALBUM_TAGS, tagId],
  queryFn: async () => {
    if (tagId === undefined) {
      return []
    }
    const albumTags = await getTagsByAlbum(tagId)
    return albumTags.map(tag => tag.tag_id)
  }
})

export const useAlbumTags = (albumIds: string[]) => useQueries({
  queries: albumIds.map(albumId => ({
    queryKey: [QUERY_KEY_ALBUM_TAGS, albumId],
    queryFn: async () => {
      console.log("Album ID: ", albumId)
      if (albumId === undefined) {
        return []
      }
      const albumTags = await getTagsByAlbum(albumId)
      console.log("Album Tags: ", albumTags)
      return albumTags.map(tag => tag.tag_id)
    }
  }))
})