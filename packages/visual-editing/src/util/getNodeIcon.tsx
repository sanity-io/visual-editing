import {
  BlockContentIcon,
  CheckmarkCircleIcon,
  CubeIcon,
  ImageIcon,
  NumberIcon,
  StringIcon,
  ThListIcon,
} from '@sanity/icons'
import type {
  SchemaArrayItem,
  SchemaNumberNode,
  SchemaObjectField,
  SchemaStringNode,
  SchemaUnionOption,
} from '@sanity/presentation-comlink'

type Option =
  | SchemaNumberNode
  | SchemaStringNode
  | SchemaArrayItem
  | SchemaObjectField
  | SchemaUnionOption

export function getNodeIcon(option: Option | undefined): React.JSX.Element {
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

  if (type === 'array' || type === 'union') {
    const of = Array.isArray(node.of) ? node.of : [node.of]
    if (of.some((n) => 'name' in n && n.name === 'block')) {
      return <BlockContentIcon />
    }
    return <ThListIcon />
  }

  if (type === 'object') {
    if (option.name === 'image') {
      return <ImageIcon />
    }
    if (option.name === 'block') {
      return <StringIcon />
    }
  }

  return <CubeIcon />
}
