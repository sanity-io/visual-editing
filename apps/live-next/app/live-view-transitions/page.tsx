import {cookies} from 'next/headers'
import NextLiveTransitions from './NextLiveTransitions'

export default async function LiveViewTransitionsPage() {
  const cookieStore = await cookies()
  const count = cookieStore.get('count')?.value || '0'
  const count2 = cookieStore.get('count2')?.value || '0'
  async function getVisibleCards() {
    'use server'
    const cookieStore = await cookies()
    return new Set((cookieStore.get('cards')?.value ?? '1,2,3,4').split(',').filter(Boolean))
  }
  const visibleCards = await getVisibleCards()
  const cards = [
    {id: '1', color: 'tan'},
    {id: '2', color: 'khaki'},
    {id: '3', color: 'thistle'},
    {id: '4', color: 'wheat'},
  ]

  async function handleIncrement() {
    'use server'
    const cookieStore = await cookies()
    cookieStore.set('count', (parseInt(cookieStore.get('count')?.value || '0') + 1).toString())
  }
  async function handleIncrement2() {
    'use server'
    const cookieStore = await cookies()
    cookieStore.set('count2', (parseInt(cookieStore.get('count2')?.value || '0') + 1).toString())
  }
  async function handleDeleteCard(id: string) {
    'use server'
    const visibleCards = await getVisibleCards()
    const cookieStore = await cookies()
    visibleCards.delete(id)
    cookieStore.set('cards', Array.from(visibleCards).join(','))
  }
  async function handleResetCards() {
    'use server'
    const cookieStore = await cookies()
    cookieStore.set('cards', '1,2,3,4')
  }

  return (
    <>
      <NextLiveTransitions selector={{count}}>
        <h1>
          Count (transition): <span style={{viewTransitionName: 'count'}}>{count}</span>
        </h1>
        <h1>Count (real): {count}</h1>
        <h1>Count2: {count2}</h1>
      </NextLiveTransitions>
      <h1>Count (real): {count}</h1>
      <form action={handleIncrement}>
        <button type="submit">Increment</button>
      </form>
      <form action={handleIncrement2}>
        <button type="submit">Increment 2</button>
      </form>
      <h1>Count2: {count2}</h1>
      <section
        style={{
          display: 'grid',
          height: '90dvh',
          placeItems: 'center',
          padding: '2rem',
        }}
      >
        <NextLiveTransitions>
          <code style={{viewTransitionName: 'fit-content-test', width: 'fit-content'}}>
            {JSON.stringify({visibleCards: Array.from(visibleCards)})}
          </code>
          <span style={{viewTransitionName: 'vis-label'}}>visibleCards:</span>
          <code>
            <span style={{viewTransitionName: 'v-card-start'}}>{'['}</span>
            {Array.from(visibleCards).map((id, i) => (
              <span key={id} style={{viewTransitionName: `v-card-s-${id}`}}>
                {JSON.stringify(id)}
                {visibleCards.size - 1 > i ? ',' : null}
              </span>
            ))}
            <span style={{viewTransitionName: 'v-card-end'}}>{']'}</span>
          </code>

          {visibleCards.size === 0 && (
            <form action={handleResetCards}>
              <button className="rounded-md bg-theme-inverse px-4 py-2 text-sm font-semibold text-theme-inverse transition ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50">
                Reset cards
              </button>
            </form>
          )}
          <ul className="cards">
            {cards.map(
              ({id, color}) =>
                visibleCards.has(id) && (
                  <li
                    key={id}
                    className="card"
                    style={{backgroundColor: color, viewTransitionName: `cards-${id}`}}
                  >
                    <form action={handleDeleteCard.bind(null, id)}>
                      <button type="submit" className="delete-btn">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Trash_font_awesome.svg"
                          alt="close button"
                        />
                        <span className="sr-only">Delete</span>
                      </button>
                    </form>
                  </li>
                ),
            )}
          </ul>
        </NextLiveTransitions>
      </section>
    </>
  )
}
