import {Image} from '@/components/image'
import {dataAttribute} from '@/sanity/dataAttribute'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'
import {PageSection} from '../PageSection'
import {FeatureHighlightSectionData, PageData} from '../types'

export function FeatureHighlight(props: {page: PageData; section: FeatureHighlightSectionData}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
      className="p-4 sm:p-5 md:p-6"
      variant={section.style?.variant}
    >
      <div className="-m-4 sm:-m-5 md:-m-6">
        {section.image?.asset && (
          <Image
            alt=""
            className="aspect[2/1] w-full"
            value={section.image}
            width={1200}
            height={600}
          />
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-xl bg-white p-4 sm:p-5 dark:bg-black">
        <h1 className="text-2xl font-extrabold sm:text-3xl md:text-4xl">{section.headline}</h1>
        {section.description && (
          <p className="mt-3 font-serif text-xl sm:mt-4 dark:text-gray-400">
            {section.description}
          </p>
        )}
        <div className="flex gap-3">
          {section.ctas &&
            section.ctas.map((cta, i) => (
              <button
                data-sanity={dataAttribute({
                  id: data._id,
                  type: data._type,
                  path: `sections[_key=="${section._key}"].ctas[_key=="${cta._key}"]`,
                }).toString()}
                className="mt-5 border border-current p-3"
                key={cta._key}
                style={{padding: '2rem'}}
              >
                {stegaClean(cta.title)}
              </button>
            ))}
        </div>
      </div>

      {section.product && (
        <Link
          className="block w-96 flex-none border border-white p-5 hover:border-gray-100 dark:border-black dark:hover:border-gray-800"
          href={`/product/${section.product.slug?.current}`}
        >
          <h2>{section.product.title}</h2>
          <div>
            {section.product.media?.asset && <Image alt="" value={section.product.media} />}
          </div>
        </Link>
      )}
    </PageSection>
  )
}
