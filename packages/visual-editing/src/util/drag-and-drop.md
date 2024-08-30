# Sanity Presentation Drag and Drop Pseudo-docs

To create an draggable group of UI elements:

## Define schema

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

Next, render your content:

```js
ctas.map((cta, i) => <button>{cta.title}</button>)
```

From here, there are a few routes to take.

---

## Draggable groups for automatic Stega overlays

When stega is enabled in your sanity client, an overlay will be created for the `<button>` element. The sanity `path` for that overlay will be something like: `ctas[_key="1234"].title`.

To allow the buttons within the array to be dragged and reordered, assign a `data-sanity-draggable` to each `<button>` element:

```js
ctas.map((cta, i) => <button data-sanity-draggable>{cta.title}</button>)
```

When each `<button>` overlay is dragged, we ignore the last part of the `path` that references the string that has stega encoding. For example: `ctas[_key="1234"].title` becomes `ctas[_key="1234"]`.

The path `ctas[_key="1234"]` tells us that the dragged item belongs to the `ctas[]` array. Now we know which elements to check against when calculating drop insert positions 🎉

**Note:** when working with automatic Stega overlays, the stega-encoded string must be a direct child of the `data-sanity-draggable` element. For example:

```js
// 🚫
ctas.map((cta, i) => (
  <button data-sanity-draggable>
    <div>{cta.title}</div>
  </button>
))
```

Here, the overlay will be created for the `<div>`, rather than the `<button>` that has the `data-sanity-draggable` data attribute. Drag and drop will not work.

---

## Draggable groups for custom overlays

For more complex use cases, such as a `card` that has mutliple text fields, or to allow a non-stega-able field to be dragged, we can pair `data-sanity-draggable` with the the `data-sanity` attribute. For example:

```js
{
  cards.map((card) => (
    // any area of this card that does not contain a stega-encoded string will be draggable
    <article
      data-sanity={dataAttribute({
        id: parentDocument._id,
        type: parentDocument._type,
        path: `sections[_key=="${section._key}"].cards[_key=="${card._key}"]`,
      })}
      style={{padding: '2rem'}}
      data-sanity-draggable
    >
      // this is stega encoded, and will open the text field on click. drag events will not fire
      from this element
      <h2>{card.title}</h2>
      ...
    </article>
  ))
}
```
