import {dataAttribute} from '@/sanity/dataAttribute'
import {PageSection} from '../PageSection'
import {IntroSectionData, PageData} from '../types'

export function Intro(props: {page: PageData; section: IntroSectionData}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
      variant={section.style?.variant}
    >
      <div className="flex w-full flex-col gap-4 p-4 pb-7 sm:px-5 md:flex-row md:px-6 md:pb-8">
        {section.headline && (
          <div className="w-full flex-shrink-0 md:max-w-44">
            <div className="sticky top-4 border-t border-current pt-2">
              <h1 className="text-sm font-bold">{section.headline}</h1>
            </div>
          </div>
        )}

        {section.intro && (
          <div
            className={
              section.headline
                ? 'w-full min-w-0 flex-grow border-current md:border-t md:pt-2'
                : 'w-full min-w-0 flex-grow border-t border-current pt-2'
            }
          >
            <p className="max-w-3xl font-serif text-lg leading-snug md:text-3xl">{section.intro}</p>
          </div>
        )}
      </div>
    </PageSection>
  )
}
