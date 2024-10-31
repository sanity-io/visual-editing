'use client'

import {Image} from '@/components/image'
import {DnDCustomBehaviour} from '@/components/page/DnDCustomBehaviour'
import {sanityFetch} from '@/sanity/live'
import {stegaClean} from '@sanity/client/stega'
import {useOptimistic} from '@sanity/visual-editing'
import {createDataAttribute, defineQuery} from 'next-sanity'

interface PageData {
  _id: string
  title: string
  children: Array<any>
}

export function Page(props: {data: PageData}) {
  const {data} = props

  const children = useOptimistic(data.children, (state: any, action: any) => {
    if (action.id === data._id && action.document.children) {
      return action.document.children
    }
    return state
  })

  return (
    <div className="p-8">
      <section>
        {children.map((child: any) => (
          <div className="align-items-center grid grid-cols-2">
            <div>
              <h2
                data-sanity={createDataAttribute({
                  id: data._id,
                  type: 'dndTestPage',
                  path: `children[_key=="${child._key}"].headingFontSize`,
                }).toString()}
                className="p-2 font-serif"
                data-resize-map="0,200,1,4"
                style={{
                  fontSize: (child.headingFontSize || 1) * 16 + 'px',
                }}
              >
                {stegaClean(child.title)}
              </h2>
            </div>
            {child.image && (
              <div className="align-items-center flex w-full place-content-center">
                <Image
                  data-sanity={createDataAttribute({
                    id: data._id,
                    type: 'dndTestPage',
                    path: `children[_key=="${child._key}"].imageMaxWidth`,
                  }).toString()}
                  data-resize-dir="ltr"
                  alt=""
                  style={{
                    maxWidth: child.imageMaxWidth
                      ? `min(${child.imageMaxWidth + 'px'}, 100%)`
                      : '100%',
                  }}
                  value={child.image}
                />
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
    // <>
    //   <DnDCustomBehaviour />
    //   <div className="p-6">
    //     <h1>{data.title}</h1>
    //     {/* Vertical */}
    //     <section className="mt-6">
    //       <h2>Vertical (Flow Auto Calculated)</h2>
    //       <div className="mt-4 flex flex-col gap-4">
    //         {children.map((child: any) => (
    //           <a
    //             data-sanity={createDataAttribute({
    //               id: data._id,
    //               type: 'dndTestPage',
    //               path: `children[_key=="${child._key}"]`,
    //             }).toString()}
    //             data-sanity-drag-group="vertical-flow-auto-calculated"
    //             className="flex justify-between border border-solid border-white p-3"
    //             key={child._key}
    //           >
    //             <p>{child.title}</p>
    //             <div>
    //               {child.childrenStrings &&
    //                 child.childrenStrings.map((s: string, i: number) => (
    //                   <span
    //                     data-sanity={createDataAttribute({
    //                       id: data._id,
    //                       type: 'dndTestPage',
    //                       path: `children[_key=="${child._key}"].childrenStrings[${i}]`,
    //                     }).toString()}
    //                     key={i}
    //                   >
    //                     {s}
    //                   </span>
    //                 ))}
    //             </div>
    //             <Image
    //               data-sanity={createDataAttribute({
    //                 id: data._id,
    //                 type: 'dndTestPage',
    //                 path: `children[_key=="${child._key}"].imageMaxWidth`,
    //               }).toString()}
    //               data-resize-dir="ltr"
    //               alt=""
    //               style={{
    //                 maxWidth: child.imageMaxWidth
    //                   ? `min(${child.imageMaxWidth + 'px'}, 100%)`
    //                   : '100%',
    //               }}
    //               value={child.image}
    //             />
    //           </a>
    //         ))}
    //       </div>
    //     </section>
    //     {/* Horizontal */}
    //     <section className="mt-6">
    //       <h2>Horizontal (Flow Auto Calculated)</h2>
    //       <div className="mt-4 flex flex-row gap-4">
    //         {data.children.map((child) => (
    //           <div
    //             data-sanity={createDataAttribute({
    //               id: data._id,
    //               type: 'dndTestPage',
    //               path: `children[_key=="${child._key}"]`,
    //             }).toString()}
    //             data-sanity-drag-group="horizontal-flow-auto-calculated"
    //             className="border border-solid border-white p-3"
    //             key={child._key}
    //           >
    //             <p>{stegaClean(child.title)}</p>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //     {/* Nested + Drag Groups */}
    //     <section className="mt-6">
    //       <h2>Nested (Flow Auto Calculated)</h2>
    //       {data.children.map((child) => (
    //         <div
    //           data-sanity={createDataAttribute({
    //             id: data._id,
    //             type: 'dndTestPage',
    //             path: `children[_key=="${child._key}"]`,
    //           }).toString()}
    //           data-sanity-drag-group="nested-flow-auto-calculated"
    //           className="mt-4 border border-solid border-white p-3"
    //           key={child._key}
    //         >
    //           {stegaClean(child.title)}
    //           {child.children &&
    //             child.children.map((child1: any) => (
    //               <div
    //                 data-sanity={createDataAttribute({
    //                   id: data._id,
    //                   type: 'dndTestPage',
    //                   path: `children[_key=="${child._key}"].children[_key=="${child1._key}"]`,
    //                 }).toString()}
    //                 className="mt-4 border border-solid border-white p-3"
    //                 key={child1._key}
    //               >
    //                 {stegaClean(child1.title)}
    //                 <div className="flew-row flex gap-3">
    //                   {child1.children &&
    //                     child1.children.map((child2: any) => (
    //                       <div
    //                         data-sanity={createDataAttribute({
    //                           id: data._id,
    //                           type: 'dndTestPage',
    //                           path: `children[_key=="${child._key}"].children[_key=="${child1._key}"].children[_key=="${child2._key}"]`,
    //                         }).toString()}
    //                         className="mt-4 border border-solid border-white p-3"
    //                         key={child2._key}
    //                       >
    //                         {stegaClean(child2.title)}
    //                       </div>
    //                     ))}
    //                 </div>
    //               </div>
    //             ))}
    //         </div>
    //       ))}
    //     </section>
    //     {/* Complex Layout */}
    //     <section className="mt-6">
    //       <h2>Complex Layout</h2>
    //       <div className="mt-4 grid grid-cols-3 gap-4">
    //         {data.children.map((child, index) => (
    //           <div
    //             data-sanity={createDataAttribute({
    //               id: data._id,
    //               type: 'dndTestPage',
    //               path: `children[_key=="${child._key}"]`,
    //             }).toString()}
    //             data-sanity-drag-group="complex-previews"
    //             className="border border-solid border-white p-3"
    //             style={{gridColumn: index === 0 || index === 5 ? 'span 2' : 'span 1'}}
    //             key={child._key}
    //           >
    //             <h3>{stegaClean(child.title)}</h3>
    //             <img src="https://placehold.co/600x400" alt="" className="mb-4 mt-4" />
    //             <p className="mt-3">
    //               Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente repudiandae
    //               distinctio, repellat officia quam odio repellendus, dolore nulla fuga corporis
    //               blanditiis atque possimus quidem.
    //             </p>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //     {/* Large vertical sections */}
    //     <section className="mt-6">
    //       <h2>Large vertical sections</h2>
    //       <div className="mt-4 flex flex-col gap-4">
    //         {data.children.slice(0, 4).map((child, index) => (
    //           <div
    //             data-sanity={createDataAttribute({
    //               id: data._id,
    //               type: 'dndTestPage',
    //               path: `children[_key=="${child._key}"]`,
    //             }).toString()}
    //             data-sanity-drag-group="large-vertical-sections"
    //             className="border border-solid border-white p-3"
    //             key={child._key}
    //           >
    //             <h3>{stegaClean(child.title)}</h3>
    //             <img src="https://placehold.co/600x400" alt="" className="mb-4 mt-4" />
    //             <p className="mt-3">
    //               Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente repudiandae
    //               distinctio, repellat officia quam odio repellendus, dolore nulla fuga corporis
    //               blanditiis atque possimus quidem.
    //             </p>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //     {/* CSS columns */}
    //     <section className="mt-6">
    //       <h2>CSS Columns (Flow override)</h2>
    //       <div className="mt-4 columns-3 gap-4">
    //         {data.children.map((child, index) => (
    //           <div
    //             data-sanity={createDataAttribute({
    //               id: data._id,
    //               type: 'dndTestPage',
    //               path: `children[_key=="${child._key}"]`,
    //             }).toString()}
    //             data-sanity-drag-group="css-columns-flow-override"
    //             data-sanity-drag-flow="vertical"
    //             className="mt-3 break-inside-avoid border border-solid border-white p-3"
    //             style={{height: `${100 + index * 100}px`}}
    //             key={child._key}
    //           >
    //             <h3>{stegaClean(child.title)}</h3>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //     {/* Custom behaviour (reverse flex flow) */}
    //     <section className="mt-6">
    //       <h2>Custom behaviour</h2>
    //       <div className="mt-4 flex flex-col gap-4">
    //         {data.children.map((child) => (
    //           <div
    //             data-sanity={createDataAttribute({
    //               id: data._id,
    //               type: 'dndTestPage',
    //               path: `children[_key=="${child._key}"]`,
    //             }).toString()}
    //             data-sanity-drag-prevent-default
    //             data-sanity-drag-group="prevent-default"
    //             className="border border-solid border-white p-3"
    //             key={child._key}
    //           >
    //             <p>{stegaClean(child.title)}</p>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //     {/* Inline */}
    //     <section className="mt-6">
    //       <h2>Inline</h2>
    //       <div className="mt-4">
    //         {data.children.map((child) => (
    //           <a
    //             data-sanity={createDataAttribute({
    //               id: data._id,
    //               type: 'dndTestPage',
    //               path: `children[_key=="${child._key}"]`,
    //             }).toString()}
    //             data-sanity-drag-group="inline"
    //             key={child._key}
    //           >
    //             {stegaClean(child.title)}
    //           </a>
    //         ))}
    //       </div>
    //     </section>
    //   </div>
    // </>
  )
}
