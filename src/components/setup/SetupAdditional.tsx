import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

interface SetupAdditionalProps {
  onNext: () => void,
  onPrevious: () => void
}

const AdditionalSettingsSchema = z.object({
  discord_rp: z.boolean().default(false).optional(),
})

export default function SetupAdditional({ onNext, onPrevious }: SetupAdditionalProps) {
  const form = useForm<z.infer<typeof AdditionalSettingsSchema>>({
    resolver: zodResolver(AdditionalSettingsSchema),
    defaultValues: {
      discord_rp: false,
    },
  })

  function onSubmit(data: z.infer<typeof AdditionalSettingsSchema>) {
    console.log(data)
  }

  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Adjust Additional Settings</h1>
      <p className={`mt-2`}>{`Here are some other features you may wish to enable:`}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={`mt-4 flex flex-row gap-2`}>
          <FormField control={form.control} name="discord_rp" render={({ field }) => (
            <FormItem className={`flex flex-row items-center`}>
              <FormLabel>Discord Rich Presence</FormLabel>
              <FormControl>
                <Switch checked={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />
        </form>
      </Form>
      <Button className={`mt-4 w-32`} onClick={onNext}>Finish</Button>
      <span className={`underline cursor-pointer mt-2`} onClick={onPrevious}>{`< Back`}</span>
    </>
  )
}