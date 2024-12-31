import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Spinner from '../ui/spinner';
import { useState } from 'react';
import { LibraryConfig, Library } from '@/types/Config';
import { invoke } from '@tauri-apps/api/core';

const ServerConfigSchema = z.object({
  name: z.string(),
  host: z.string().url(),
  port: z.number().optional(),
  username: z.string(),
  password: z.string(),
})

interface ServerConfigModalProps {
  libraries: Library[]
  onClose: () => void
  onConnectionSuccess: (library: Library) => void
}

export default function ServerConfigModal({ libraries, onClose, onConnectionSuccess }: ServerConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof ServerConfigSchema>>({
    resolver: zodResolver(ServerConfigSchema),
    defaultValues: {
      name: '',
      host: '',
      port: undefined,
      username: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof ServerConfigSchema>) {
    setIsLoading(true)

    //Ensure id is unique
    if (libraries.some(l => l.id === values.name)) {
      form.setError('name', { type: "focus", message: 'A library with this name already exists' }, { shouldFocus: true })
      return
    }

    let libraryConfig: LibraryConfig = {
      id: values.name.replaceAll(/\s/g, '_'),
      name: values.name,
      host: values.host,
      port: values.port,
      username: values.username,
      password: values.password,
    }
    invoke('add_server', { library: libraryConfig })
      .then((res) => {
        let newLibrary: Library = res as Library
        onConnectionSuccess(newLibrary)
      }).catch(() => {
        form.setError('root', { type: "connectionError" })
      }).finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <Form {...form}>
      <form className={`dark:text-slate-50 flex flex-col gap-2`} onSubmit={form.handleSubmit(onSubmit)}>
        {form.formState.errors.root && <p>Failed to connect to the server. Please check your connection details and try again.</p>}
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              How you would like Polyphonic to refer to this server as.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="host" render={({ field }) => (
          <FormItem>
            <FormLabel>Host</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              The host of the server.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="port" render={({ field }) => (
          <FormItem>
            <FormLabel>Port</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              The port of the server (if applicable).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem className={`mt-2`}>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter className={`mt-4 flex flex-row items-center`}>
          {isLoading && (
            <div className={`mr-auto flex flex-row`}>
              <Spinner size={20} className={`mr-2`} />
              <span>Testing Connection...</span>
            </div>
          )}

          <div className={`ml-auto flex flex-row`}>
            <Button variant={'outline'} className={`mr-2`} onClick={onClose}>Cancel</Button>
            <Button className={`ml-auto`} type="submit">Confirm</Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  )
}