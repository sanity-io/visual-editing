# Presentation: Drag and Drop

## Introduction

Without a real-time representation of the building blocks that make up a page, it can be difficult for editors to determine the visual outcome of their work.

Drag and drop helps solve this by enabling editors to visually rearrange content within the context of their application/website — allowing them to re-order array items with immediate visual feedback and dynamic zoomed-out overviews.

## Prerequisites

- An existing Sanity project with [Visual Editing](https://www.sanity.io/docs/introduction-to-visual-editing) enabled.
- Some understanding of [Stega](https://www.sanity.io/docs/stega) and how to [enable Sanity Overlays](https://www.sanity.io/docs/visual-editing-overlays#0fc0c885688b).

## How it works

Presentation's Drag and drop functionality is framework-agnostic and can be implemented without significant changes to your codebase. It uses [Overlays](https://www.sanity.io/docs/visual-editing-overlays) for visual representation, and updates your structured content directly. It does not mutate/reorder the DOM.

Here’s what happens in a Presentation drag and drop sequence:

1. An [Overlay](https://www.sanity.io/docs/visual-editing-overlays) element is dragged to a new position on the page.
2. The array order in Sanity is updated, reflecting the item’s new position.
3. Your front-end receives the updated Sanity data and re-renders as normal.

## Studio setup

Drag and drop is available for `array` schema types:

```jsx
defineField({
  type: 'array',
  name: 'ctas',
  title: 'CTAs',
  of: [
    {
      type: 'object',
      name: 'cta',
      title: 'CTA',
      fields: [
        ...
      ],
    },
  ],
}),
```

## Application setup

Drag and drop is enabled by default for any element with a `data-sanity` attribute that points directly to an `array` path. [You can read more about Sanity attributes here.](https://www.sanity.io/docs/visual-editing-overlays#cb95b19a0263)

### Path requirements

To correctly assign `data-sanity` attributes for arrays, you will need:

- The array parent document `_id` .
- The array parent document `_type` .
- The array `name`.
- The `_key` value for each array child.

### Applying attribution

Sanity’s [attribution functions](https://www.sanity.io/docs/visual-editing-overlays#cb95b19a0263) can be used to create direct mappings to array children:

```jsx
import {createDataAttribute} from '@sanity/visual-editing'

{
  arrayItems.map((arrayItem, i) => (
    <button
      data-sanity={createDataAttribute({
        id: parentDocument._id,
        type: parentDocument._type,
        path: `arrayItems[_key=="${arrayItem._key}"]`,
      })}
    ></button>
  ))
}
```

**\*Note:** these examples are written in JSX, but the pattern applies to all frameworks.\*

Once an array child has a `data-sanity` attribute, drag and drop will be enabled by default. This will be reflected in the element’s Overlay label.

[You can view an example of drag and drop implemented across a page here.](https://github.com/sanity-io/visual-editing/blob/main/apps/page-builder-demo/src/app/dnd/page.tsx)

### Data updates

Changes made using drag and drop within Presentation will automatically update your Sanity data. You don’t need to perform any mutations manually. You will, however, experience a delay relative to the size and complexity of the parent document. For the fastest possible feedback loop, explore the `useOptimistic` hook.

## UX

### Drag direction

Drag and drop is designed for simple UX and low-touch integration. To achieve this, it makes some assumptions:

1. The web page is using a left-to-right, top-to-bottom format with a logical content flow.
2. Drag groups can be broken into two categories — horizontal and vertical.

Presentation will calculate the direction of a drag group based on the alignment of it’s children.

A drag group with children that share a y-axis is `horizontal`.

A drag group with children that do not share a y-axis is `vertical`.

Both the direction and insert logic can be [customised](#customising-drag-and-drop).

### Minimap

When a user drags an item that belongs to a group that is larger than the screen height, they can press the `shift` key while scrolling or dragging to enter Minimap mode. This applies a 3d transform to page to focus the group within the viewport.

Minimap can be [disabled](#customising-drag-and-drop) on a per-element basis.

## Customising drag and drop

### Data attributes

Drag and drop’s default behaviour can be customised using HTML `data-attributes` :

| Attribute                          | Use Case                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `data-sanity-drag-disable`         | Disable drag and drop.                                                                                                    |
| `data-sanity-drag-flow`            | Override the default drag direction.                                                                                      |
| `data-sanity-drag-group`           | Manually assign an element to a drag group. Useful when there are multiple elements representing the same data on a page. |
| `data-sanity-drag-prevent-default` | Prevent data from updating after drag sequences. Useful for defining [custom insert behaviour](#custom-events).           |
| `data-sanity-drag-minimap-disable` | Disable Minimaps.                                                                                                         |

### Custom events

Drag and drop emits a custom `sanity/dragEnd` event when an element is dropped.

`sanity/dragEnd` events can be used alongside Presentation’s `useDocuments` functionality to override the default drag and drop mutation logic. This is useful for defining custom behaviour for non left-to-right/top-to-bottom languages, or other bespoke use cases. [See this example.](https://github.com/sanity-io/visual-editing/blob/main/apps/page-builder-demo/src/components/page/DnDCustomBehaviour.tsx)

_`useDocuments` is currently only available as a React hook._

## Debugging common issues

### **Preventing Stega children from overriding array paths**

Occasionally, a Stega-encoded string can override drag and drop on a parent array item. Here, the `title` string occupies the entire `<button>` element. The `title` automatically has an Overlay created for it, which prevents interaction with the parent Overlay:

```jsx
<button
  data-sanity={dataAttribute({
    id: parentDocument._id,
    type: parentDocument._type,
    path: `arrayItems[_key=="${arrayItem._key}"]`,
  })}
>
  {arrayItem.title}
</button>
```

To prevent this, use `stegaClean` :

```jsx
import {stegaClean} from '@sanity/client/stega'

<button
  ...
>
  {stegaClean(arrayItem.title)}
</button>
```

Or add some visual padding to the array child to create space for the “draggable” area:

```jsx
<button
  ...
  style={{padding: '1rem'}}
>
  {arrayItem.title}
</button>
```

## Browser/device support

- Chrome ≥ 108
- Safari ≥ 15.6
- Firefox ≥ 115
- Edge ≥ 126

Drag and drop is a desktop-only feature.
