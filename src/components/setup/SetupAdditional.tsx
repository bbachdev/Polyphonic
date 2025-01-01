import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Config } from '@/types/Config';

interface SetupAdditionalProps {
  onFinish: (additional: Partial<Config>) => void,
  onPrevious: () => void
}

const AdditionalSettingsSchema = z.object({
  discord_rp: z.boolean().default(false).optional(),
})

export default function SetupAdditional({ onFinish, onPrevious }: SetupAdditionalProps) {
  const form = useForm<z.infer<typeof AdditionalSettingsSchema>>({
    resolver: zodResolver(AdditionalSettingsSchema),
    defaultValues: {
      discord_rp: false,
    },
  })

  function onSubmit(data: z.infer<typeof AdditionalSettingsSchema>) {
    console.log("onSubmit", data)
    onFinish({ discord_rp: data.discord_rp })
  }

  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Adjust Additional Settings</h1>
      <p className={`mt-2`}>{`Here are some other features you may wish to enable:`}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={`mt-8 flex flex-col gap-2 items-center`}>
          <FormField control={form.control} name="discord_rp" render={({ field }) => (
            <FormItem className={`flex flex-row items-center gap-2 space-y-0`}>
              <FormLabel>Discord Rich Presence</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />
          <Button className={`mt-6 w-32`} type='submit'>Finish</Button>
        </form>
      </Form>
      <span className={`underline cursor-pointer mt-2`} onClick={onPrevious}>{`< Back`}</span>
    </>
  )
}