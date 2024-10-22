import {dataAttribute} from '@/sanity/dataAttribute'
import type {SanityDocument} from '@sanity/client'
import {createDataAttribute, useOptimistic} from '@sanity/visual-editing'
import React from 'react'
import {PageSection} from '../PageSection'
import {ProductModel} from '../ProductModel'
import {IntroSectionData, PageData} from '../types'

export function Intro(props: {page: PageData; section: IntroSectionData}) {
  const {page: data, section} = props

  const intro = useOptimistic<string | undefined, SanityDocument<PageData>>(
    section.intro,
    (state, action) => {
      if (action.id === data._id) {
        if (!Array.isArray(action.document.sections)) {
          console.log('WARNING', action.document.sections)
          return state
        }
        const intro = (
          action.document.sections?.find((s) => s._key === section._key) as IntroSectionData
        )?.intro
        if (intro) {
          return intro
        }
      }
      return state
    },
  )

  const rotations = useOptimistic<
    {pitch: number; yaw: number} | undefined,
    SanityDocument<PageData>
  >(section.rotations, (state, action) => {
    if (action.id === data._id) {
      if (!Array.isArray(action.document.sections)) {
        console.log('WARNING', action.document.sections)
        return state
      }
      const rotations = (
        action.document.sections?.find((s) => s._key === section._key) as IntroSectionData
      )?.rotations
      if (rotations) {
        return rotations
      }
    }
    return state
  })

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
            <p className="max-w-3xl font-serif text-lg leading-snug md:text-3xl">{intro}</p>
          </div>
        )}
      </div>
      <div
        style={{height: '40rem', width: '100%'}}
        className="mt-5"
        data-sanity={createDataAttribute({
          id: data._id,
          type: data._type,
          path: `sections[_key=="${section._key}"].rotations`,
        })()}
      >
        <ProductModel rotations={rotations || {pitch: 0, yaw: 0}} />
      </div>
    </PageSection>
  )
}
