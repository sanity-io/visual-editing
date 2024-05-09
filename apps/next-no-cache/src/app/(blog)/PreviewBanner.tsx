export default function PreviewBanner() {
  return (
    <div className="bg-black p-3 text-center text-white">
      {'Previewing drafts. '}
      <a className="underline transition hover:opacity-50" href="/api/disable-draft">
        Back to published
      </a>
    </div>
  )
}
