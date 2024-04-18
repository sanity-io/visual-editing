/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */
import {PortableText} from '@portabletext/react'

import styles from './PostBody.module.css'

export default function PostBody({
  body,
}: {
  body: React.ComponentProps<typeof PortableText>['value']
}) {
  return (
    <div className={`mx-auto max-w-2xl ${styles.portableText}`}>
      <PortableText value={body} />
    </div>
  )
}
