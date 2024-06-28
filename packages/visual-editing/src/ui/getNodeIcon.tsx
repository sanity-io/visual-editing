import type {
  SchemaArrayItem,
  SchemaNumberNode,
  SchemaObjectField,
  SchemaStringNode,
  SchemaUnionOption,
} from '@repo/visual-editing-helpers'
import {
  BlockContentIcon,
  CheckmarkCircleIcon,
  CubeIcon,
  ImageIcon,
  NumberIcon,
  StringIcon,
  ThListIcon,
} from '@sanity/icons'

export function getNodeIcon(
  option:
    | SchemaNumberNode
    | SchemaStringNode
    | SchemaArrayItem
    | SchemaObjectField
    | SchemaUnionOption
    | undefined,
): JSX.Element {
  if (!option) return <CubeIcon />

  if (option.type === 'string') {
    return <StringIcon />
  }

  if (option.type === 'number') {
    return <NumberIcon />
  }

  const {value: node} = option

  if ('icon' in option && option.icon) {
    return <div dangerouslySetInnerHTML={{__html: option.icon}} />
  }

  const {type} = node

  if (type === 'string') {
    return <StringIcon />
  }

  if (type === 'boolean') {
    return <CheckmarkCircleIcon />
  }

  if (type === 'number') {
    return <NumberIcon />
  }

  if (type === 'array') {
    // if (t.of.some((o) => isTypeOf(o, 'block'))) {
    //   return BlockContentIcon
    // }

    return <ThListIcon />
  }

  if (type === 'object') {
    // if (isTypeOf(t, 'image')) {
    //   return ImageIcon
    // }
    // if (isTypeOf(t, 'block')) {
    //   return StringIcon
    // }
  }

  return <CubeIcon />
}
