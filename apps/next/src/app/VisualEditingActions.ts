'use server'
/**
 * The code in this file will be ported to `next-sanity`
 */
import { draftMode } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function revalidateRootLayout() {
  if (!draftMode().isEnabled) {
    console.debug(
      'Skipped revalidatePath request because draft mode is not enabled',
    )
    return
  }
  await revalidatePath('/', 'layout')
}
