'use server'

// import {verifyPreviewSecret} from '@/sanity/lib/live'
import {revalidatePath, updateTag} from 'next/cache'
import {draftMode} from 'next/headers'

// @TODO revisit this later
// export async function handleDraftModeAction(secret: string): Promise<void | string> {
//   console.log('Server Action wants to enable Draft Mode', {secret})

//   if ((await draftMode()).isEnabled) {
//     // eslint-disable-next-line no-console
//     console.log('Draft Mode is already enabled')
//     return
//   }

//   try {
//     const {isValid} = await verifyPreviewSecret(secret)

//     if (!isValid) {
//       return 'Invalid secret provided'
//     }

//     console.log('Enabling Draft Mode')
//     ;(await draftMode()).enable()
//   } catch (err) {
//     console.error('Failed to verify preview secret', {secret}, err)
//     return 'Unexpected error'
//   }
// }

export async function disableDraftMode() {
  'use server'
  await Promise.allSettled([
    (await draftMode()).disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ])
}

export async function purgeEverything() {
  revalidatePath('/', 'layout')
}

export async function purgeSanity() {
  updateTag('sanity')
}
