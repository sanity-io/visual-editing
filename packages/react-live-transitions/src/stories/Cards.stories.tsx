import type {Meta, StoryObj} from '@storybook/react'
import {memo, useCallback, useMemo, useState} from 'react'
import isEqual from 'react-fast-compare'
import {DebugLayoutShift} from '../DebugLayoutShift'
import {TransitionLayoutShift} from '../TransitionLayoutShift'

const TransitionLayoutShiftMemo = memo(TransitionLayoutShift, isEqual)

function TransitionLayoutShiftOptimized(
  props: React.ComponentProps<typeof TransitionLayoutShift> & {
    cards: number
    deletedCards: Set<string>
  },
) {
  return <TransitionLayoutShift>{props.children}</TransitionLayoutShift>
}
const TransitionLayoutShiftMemoOptimized = memo(
  TransitionLayoutShiftOptimized,
  (prevProps, nextProps) =>
    isEqual(
      {cards: prevProps.cards, deletedCards: prevProps.deletedCards},
      {cards: nextProps.cards, deletedCards: nextProps.deletedCards},
    ),
)

function Template(props: {cards: number; count: number; debug: boolean}) {
  const {cards: _cards, count, debug} = props
  const [deletedCards, setDeletedCards] = useState(() => new Set<string>())

  const cards = useMemo(() => {
    return Array.from({length: _cards}, (_, index) => ({
      id: `${index + 1}`,
      color: index % 0 ? 'tan' : index % 1 ? 'khaki' : index % 2 ? 'thistle' : 'wheat',
    }))
  }, [_cards])

  const handleDeleteCard = useCallback((id: string) => {
    setDeletedCards((deletedCards) => {
      if (!deletedCards.has(id)) {
        const nextCards = new Set(deletedCards)
        nextCards.add(id)
        return nextCards
      }

      return deletedCards
    })
  }, [])

  const ul = useMemo(
    () => (
      <ul className="cards">
        {cards.map(
          ({id, color}) =>
            !deletedCards.has(id) && (
              <li
                key={id}
                className="card"
                style={{backgroundColor: color, viewTransitionName: `cards-${id}`}}
              >
                <button
                  onClick={handleDeleteCard.bind(null, id)}
                  type="button"
                  className="delete-btn"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Trash_font_awesome.svg"
                    alt="close button"
                  />
                  <span className="sr-only">Delete</span>
                </button>
              </li>
            ),
        )}
      </ul>
    ),
    [cards, deletedCards, handleDeleteCard],
  )
  const children = useMemo(
    () => (
      <section
        style={{
          display: 'grid',
          height: '90dvh',
          placeItems: 'center',
          padding: '2rem',
        }}
      >
        {ul}
      </section>
    ),
    [ul],
  )

  return (
    <>
      {debug && <DebugLayoutShift />}
      {/* <TransitionLayoutShift>{children}</TransitionLayoutShift> */}
      {/* <TransitionLayoutShiftMemo>
        {
          <section
            style={{
              display: 'grid',
              height: '90dvh',
              placeItems: 'center',
              padding: '2rem',
            }}
          >
            {ul}
          </section>
        }
      </TransitionLayoutShiftMemo> */}
      <TransitionLayoutShiftMemoOptimized cards={_cards + count} deletedCards={deletedCards}>
        <section
          style={{
            display: 'grid',
            height: '90dvh',
            placeItems: 'center',
            padding: '2rem',
          }}
        >
          <ul className="cards">
            {cards.map(
              ({id, color}) =>
                !deletedCards.has(id) && (
                  <li
                    key={id}
                    className="card"
                    style={{backgroundColor: color, viewTransitionName: `cards-${id}`}}
                  >
                    <button
                      onClick={handleDeleteCard.bind(null, id)}
                      type="button"
                      className="delete-btn"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Trash_font_awesome.svg"
                        alt="close button"
                      />
                      <span className="sr-only">Delete</span>
                    </button>
                  </li>
                ),
            )}
          </ul>
        </section>
      </TransitionLayoutShiftMemoOptimized>
      {/* <div>count: {count}</div> */}
    </>
  )
}

const meta = {
  title: 'Cards',
  component: Template,
  args: {
    debug: true,
    cards: 4,
    count: 0,
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Template>

export default meta
type Story = StoryObj<typeof meta>

export const TransitionLayoutShiftExample: Story = {}
