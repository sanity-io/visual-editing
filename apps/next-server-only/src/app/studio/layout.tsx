import RootLayout from '../layout'

// Re-uses root layout, but doesn't pass down the visual editing prop as it's not needed
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RootLayout visualEditing={null}>{children}</RootLayout>
}
