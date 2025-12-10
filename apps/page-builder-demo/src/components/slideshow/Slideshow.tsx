'use client'

import './Slideshow.css'
import {useState} from 'react'

import type {Product} from '@/sanity.types'

import {Image} from '../image'

export function Slideshow(props: {images: NonNullable<Product['media']>}) {
  const {images} = props
  const len = images.length
  const [index, setIndex] = useState(0)

  return (
    <div className="slideshow">
      <div>
        {images.map(
          (image, idx) =>
            image.asset && (
              <Image
                alt=""
                className="slideshow__image"
                data-current={index === idx ? '' : undefined}
                key={idx}
                value={image}
              />
            ),
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 text-center">
          <button
            className="p-3 text-lg leading-none hover:bg-gray-50 dark:hover:bg-gray-950"
            onClick={() => setIndex((i) => (i - 1 + len) % len)}
            type="button"
          >
            &larr;
          </button>
          <button
            className="p-3 text-lg leading-none hover:bg-gray-50 dark:hover:bg-gray-950"
            onClick={() => setIndex((i) => (i + 1) % len)}
            type="button"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
