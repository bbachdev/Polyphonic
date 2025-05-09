import { Library } from '@/types/Config'
import { QUERY_KEY_LIBRARIES } from '@/util/query'
import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

export const useLibraries = () => useQuery({
  queryKey: [QUERY_KEY_LIBRARIES],
  queryFn: async () => {
    return await invoke('get_libraries')
    .then(async (libraries: any) => {
      const library_data: Library[] = libraries as Library[]
      const libraryMap = new Map<String, Library>()
      library_data.forEach(library => {
        libraryMap.set(library.id, library)
      })
      return libraryMap

    }).catch(() => {
      console.log("Failed to get libraries")
      return new Map<String, Library>()
    })
  }
})