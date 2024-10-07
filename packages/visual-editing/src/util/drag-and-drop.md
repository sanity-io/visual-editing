> [!WARNING]
> Drag and Drop is an experimental feature. This documentation serves as a rough guide, and it's contents are subject to change.

# Drag and Drop

To create an draggable group of UI elements:

## 1. Define schema

First, define an `array` field in your schema, for example:

```js
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
        defineField({
          type: 'string',
          name: 'title',
          title: 'Title',
        }),
      ],
    },
  ],
}),
```

## 2. Render and define paths

Drag and drop will be enabled by default for any element with a direct array `path`.

For example:

```js
// ✅ drag and drop enabled
{
  ctas.map((cta, i) => (
    <button
      data-sanity={dataAttribute({
        id: parentDocument._id,
        type: parentDocument._type,
        path: `sections[_key=="${section._key}"].ctas[_key=="${cta._key}"]`,
      })}
    >
      // prevent stega-encoded string from becoming the overlay target
      {stegaClean(cta.title)}
    </button>
  ))
}
```

```js
// 🚫 drag and drop disabled
{
  ctas.map((cta, i) => (
    <button
      data-sanity={dataAttribute({
        id: parentDocument._id,
        type: parentDocument._type,
        path: `sections[_key=="${section._key}"].ctas[_key=="${cta._key}"]`,
      })}
    >
      // overlay is created for the path sections[].ctas[].title, drag and drop cannot be enabled
      {cta.title}
    </button>
  ))
}
```

You can disable drag and drop on any element using the `data-sanity-drag-disable` data attribute:

```js
<button data-sanity-drag-disable></button>
```

_This data attribute can be added to every item in an array, or to specific items._

## Layout and language support

Currently, drag and drop supports horizontal/top-bottom languages. It can infer layout for the following CSS layout types:

- Inline/Inline Block elements
- Block elements
- Non `reverse` Flex layouts
- 1-dimensional CSS Grid layouts
