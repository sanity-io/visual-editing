/* eslint-disable @typescript-eslint/ban-types */

import { type SanityNode } from 'visual-editing-helpers'

export type SanityPrimitive = string | number | boolean | null
export type SanityObject = { [key: string]: SanityValue }
export type SanityArray = Array<SanityPrimitive> | Array<SanityObject>
export type SanityValue = SanityPrimitive | SanityArray | SanityObject

export interface SourceNode<T = Primitive> {
  $$type$$: 'sanity'
  value: T
  source: SanityNode | undefined
}

export type Primitive = string | boolean | number | null

export type SanityKey =
  | '_createdAt'
  | '_dataset'
  | '_id'
  | '_key'
  | '_originalId'
  | '_projectId'
  | '_ref'
  | '_rev'
  | '_strengthenOnPublish'
  | '_type'
  | '_updatedAt'
  | '_weak'

export type WrappedValue<T = SanityValue> = T extends null
  ? null
  : T extends string
  ? SourceNode<string> // string
  : T extends number
  ? SourceNode<number> // number
  : T extends boolean
  ? SourceNode<boolean> // boolean
  : T extends {}
  ? {
      [Prop in keyof T]: Prop extends SanityKey
        ? T[Prop]
        : WrappedValue<T[Prop]>
    } // object
  : T extends unknown[]
  ? WrappedValue<T[number]>[] // array
  : never

export interface SanityNodeContext {
  baseUrl: string
  dataset: string
  projectId: string
  tool?: string
  workspace?: string
}
