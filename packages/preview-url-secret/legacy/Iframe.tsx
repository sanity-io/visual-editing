/* eslint-disable react/jsx-no-bind */
import { WarningOutlineIcon } from '@sanity/icons'
import {
  Box,
  Card,
  Container,
  Flex,
  Spinner,
  Stack,
  Text,
  usePrefersReducedMotion,
} from '@sanity/ui'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import React, {
  forwardRef,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react'
import { HTMLAttributeReferrerPolicy } from 'react'
import { SanityDocument } from 'sanity'

import { UrlResolver } from './defineUrlResolver'
import { GetUrlSecret } from './GetUrlSecret'
import { UrlSecretId } from './isValidSecret'
import { DEFAULT_SIZE, sizes, Toolbar } from './Toolbar'
import {
  IframeSizeKey,
  MissingSlug,
  SetError,
  type UrlState,
} from '../src/types'

export type { IframeSizeKey, UrlResolver, UrlSecretId }

export type IframeOptions = {
  urlSecretId?: UrlSecretId
  url: UrlState | UrlResolver
  defaultSize?: IframeSizeKey
  loader?: string | boolean
  showDisplayUrl?: boolean
  reload?: {
    revision?: boolean | number
    button?: boolean
  }
  attributes?: Partial<{
    allow: string
    referrerPolicy: HTMLAttributeReferrerPolicy | undefined
    sandbox: string
    onLoad: () => void
  }>
}

const MotionFlex = motion(Flex)

export interface IframeProps {
  document: {
    displayed: SanityDocument
  }
  options: IframeOptions
}

export function Iframe(props: IframeProps) {
  const [error, setError] = useState<unknown>(null)
  if (error) {
    throw error
  }

  const { document: sanityDocument, options } = props
  const {
    url,
    urlSecretId,
    defaultSize = DEFAULT_SIZE,
    reload,
    loader = 'Loading…',
    attributes = {},
    showDisplayUrl = true,
  } = options
  const [iframeSize, setIframeSize] = useState(
    sizes?.[defaultSize] ? defaultSize : DEFAULT_SIZE,
  )

  // Workaround documents that initially appears to be an empty new document but just hasen't loaded yet
  const [workaroundEmptyDocument, setWorkaroundEmptyDocument] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setWorkaroundEmptyDocument(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

  const prefersReducedMotion = usePrefersReducedMotion()
  const [urlState, setUrlState] = useState<UrlState>(() =>
    typeof url === 'function' ? '' : url,
  )

  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)

  const iframe = useRef<HTMLIFrameElement>(null)
  const { displayed } = sanityDocument

  const handleReload = useCallback(() => {
    if (!iframe?.current) {
      return
    }

    // Funky way to reload an iframe without CORS issues
    // eslint-disable-next-line no-self-assign
    iframe.current.src = iframe.current.src

    setReloading(true)
  }, [])

  const deferredRevision = useDeferredValue(displayed._rev)
  const displayUrl = typeof urlState === 'string' ? urlState : ''

  return (
    <MotionConfig
      transition={prefersReducedMotion ? { duration: 0 } : undefined}
    >
      <Flex direction="column" style={{ height: `100%` }}>
        <Toolbar
          displayUrl={displayUrl}
          iframeSize={iframeSize}
          reloading={reloading}
          setIframeSize={setIframeSize}
          showDisplayUrl={showDisplayUrl}
          reloadButton={!!reload?.button}
          handleReload={handleReload}
        />
        {urlState === MissingSlug && !workaroundEmptyDocument ? (
          <MissingSlugScreen />
        ) : (
          <Card tone="transparent" style={{ height: `100%` }}>
            <Frame
              ref={iframe}
              loader={loader}
              loading={loading}
              reloading={reloading}
              iframeSize={iframeSize}
              setReloading={setReloading}
              setLoading={setLoading}
              displayUrl={displayUrl}
              attributes={attributes}
            />
          </Card>
        )}
        {typeof url === 'function' && (
          <AsyncUrl
            // We use the revision as a key, to force a re-render when the revision changes
            // This allows us to respond to changed props (maybe the url function itself changes)
            // But avoid calling async logic on every render accidentally
            key={deferredRevision}
            url={url}
            displayed={displayed}
            urlSecretId={urlSecretId}
            setDisplayUrl={setUrlState}
            setError={setError}
          />
        )}
        {displayUrl && (reload?.revision || reload?.revision === 0) && (
          <ReloadOnRevision
            revision={reload.revision}
            _rev={deferredRevision}
            handleReload={handleReload}
          />
        )}
      </Flex>
    </MotionConfig>
  )
}

interface FrameProps
  extends Required<Pick<IframeOptions, 'loader' | 'attributes'>> {
  loader: string | boolean
  loading: boolean
  reloading: boolean
  setLoading: (loading: boolean) => void
  setReloading: (reloading: boolean) => void
  iframeSize: IframeSizeKey
  displayUrl: string
}
const Frame = forwardRef(function Frame(
  props: FrameProps,
  iframe: React.ForwardedRef<HTMLIFrameElement>,
) {
  const {
    loader,
    loading,
    setLoading,
    iframeSize,
    attributes,
    reloading,
    displayUrl,
    setReloading,
  } = props

  function handleIframeLoad() {
    setLoading(false)
    setReloading(false)
    // Run onLoad from attributes
    if (attributes.onLoad && typeof attributes.onLoad === 'function') {
      attributes.onLoad()
    }
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{ height: `100%`, position: `relative` }}
    >
      <AnimatePresence>
        {loader && loading && (
          <MotionFlex
            initial="initial"
            animate="animate"
            exit="exit"
            variants={spinnerVariants}
            justify="center"
            align="center"
            style={{ inset: `0`, position: `absolute` }}
          >
            <Flex
              style={{ ...sizes[iframeSize] }}
              justify="center"
              align="center"
              direction="column"
              gap={4}
            >
              <Spinner muted />
              {loader && typeof loader === 'string' && (
                <Text muted size={1}>
                  {loader}
                </Text>
              )}
            </Flex>
          </MotionFlex>
        )}
      </AnimatePresence>
      <motion.iframe
        ref={iframe}
        title="preview"
        frameBorder="0"
        style={{ maxHeight: '100%' }}
        src={displayUrl}
        initial={['background', iframeSize]}
        variants={iframeVariants}
        animate={[
          loader && loading ? 'background' : 'active',
          reloading ? 'reloading' : 'idle',
          iframeSize,
        ]}
        {...attributes}
        onLoad={handleIframeLoad}
      />
    </Flex>
  )
})

const spinnerVariants = {
  initial: { opacity: 1 },
  animate: { opacity: [0, 0, 1] },
  exit: { opacity: [1, 0, 0] },
}

const iframeVariants = {
  ...sizes,
  desktop: {
    ...sizes.desktop,
    boxShadow: '0 0 0 0px var(--card-shadow-outline-color)',
  },
  mobile: {
    ...sizes.mobile,
    boxShadow: '0 0 0 1px var(--card-shadow-outline-color)',
  },
  background: {
    opacity: 0,
    scale: 1,
  },
  idle: {
    scale: 1,
  },
  reloading: {
    scale: [1, 1, 1, 0.98],
  },
  active: {
    opacity: [0, 0, 1],
    scale: 1,
  },
}

interface ReloadOnRevisionProps {
  _rev?: string
  revision: number | boolean
  handleReload: () => void
}
function ReloadOnRevision(props: ReloadOnRevisionProps) {
  const { revision, handleReload, _rev } = props
  const [initialRev] = useState(_rev)
  // Reload on new revisions
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (_rev !== initialRev) {
      const timeout = setTimeout(
        handleReload,
        Number(revision === true ? 300 : revision),
      )
      return () => clearTimeout(timeout)
    }
  }, [_rev, revision, handleReload, initialRev])

  return null
}

interface AsyncUrlProps {
  displayed: SanityDocument
  url: UrlResolver
  urlSecretId?: UrlSecretId
  setDisplayUrl: (url: UrlState) => void
  setError: SetError
}
function AsyncUrl(props: AsyncUrlProps) {
  const { urlSecretId, setDisplayUrl, setError } = props
  // Snapshot values we only care about when the revision changes, done by changing the `key` prop
  const [displayed] = useState(props.displayed)
  const [url] = useState(() => props.url)
  const [urlSecret, setUrlSecret] = useState<null | string>(null)

  // Set initial URL and refresh on new revisions
  useEffect(() => {
    if (urlSecretId && !urlSecret) return

    const getUrl = async (signal: AbortSignal) => {
      const resolveUrl = await url(displayed, urlSecret, abort.signal)

      // Only update state if URL has changed
      if (!signal.aborted && resolveUrl) {
        setDisplayUrl(resolveUrl)
      }
    }

    const abort = new AbortController()
    getUrl(abort.signal).catch(
      (error) => error.name !== 'AbortError' && setError(error),
    )
    // eslint-disable-next-line consistent-return
    return () => abort.abort()
  }, [displayed, setDisplayUrl, setError, url, urlSecret, urlSecretId])

  if (urlSecretId) {
    return (
      <GetUrlSecret
        urlSecretId={urlSecretId}
        urlSecret={urlSecret}
        setUrlSecret={setUrlSecret}
        setError={setError}
      />
    )
  }

  return null
}

export function MissingSlugScreen() {
  return (
    <Card height="fill">
      <Flex
        align="center"
        height="fill"
        justify="center"
        padding={4}
        sizing="border"
      >
        <Container width={0}>
          <Card padding={4} radius={2} shadow={1} tone="caution">
            <Flex>
              <Box>
                <Text size={1}>
                  <WarningOutlineIcon />
                </Text>
              </Box>
              <Stack flex={1} marginLeft={3} space={3}>
                <Text as="h1" size={1} weight="bold">
                  Missing slug
                </Text>
                <Text as="p" muted size={1}>
                  Add a slug to see the preview.
                </Text>
              </Stack>
            </Flex>
          </Card>
        </Container>
      </Flex>
    </Card>
  )
}
