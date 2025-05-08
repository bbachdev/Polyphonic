import { getTags } from '@/util/db'
import { QUERY_KEY_TAGS } from '@/util/query'
import { useQuery } from '@tanstack/react-query'

export const useTags = () => useQuery({
  queryKey: [QUERY_KEY_TAGS],
  queryFn: () => getTags()
})