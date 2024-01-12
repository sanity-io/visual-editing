import { format, parseISO } from 'date-fns'
import Balancer from 'react-wrap-balancer'

export default function PostDate({ dateString }: { dateString: string }) {
  const date = parseISO(dateString)
  return (
    <time dateTime={dateString}>
      <Balancer>{format(date, 'LLLL d, yyyy')}</Balancer>
    </time>
  )
}
