import {EditIcon, RevertIcon} from '@sanity/icons'
import {Card, Code, Stack} from '@sanity/ui'
import {startTransition, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {EMPTY, switchMap} from 'rxjs'
import {
  defineDocumentFieldAction,
  FormFieldSet,
  getPublishedId,
  ObjectInputMember,
  set,
  unset,
  useDocumentPreviewStore,
  useDocumentStore,
  type DocumentFieldActionItem,
  type EditStateFor,
  type FieldMember,
  type FieldProps,
  type ObjectFormNode,
  type ObjectInputProps,
  type ObjectMember,
} from 'sanity'

function useReferenceEditState(documentId?: string): EditStateFor | undefined {
  const documentStore = useDocumentStore()
  const previewStore = useDocumentPreviewStore()
  const [editState, setEditState] = useState<EditStateFor | undefined>()

  useEffect(() => {
    startTransition(() => setEditState(undefined))

    if (!documentId) return undefined

    const type$ = previewStore.observeDocumentTypeFromId(documentId)
    const editState$ = type$.pipe(
      switchMap((type) => {
        if (!type) return EMPTY

        return documentStore.pair.editState(getPublishedId(documentId), type)
      }),
    )

    const sub = editState$.subscribe({next: setEditState})

    return () => sub.unsubscribe()
  }, [documentId, documentStore, previewStore])

  return editState
}

function isFieldMember(member: ObjectMember): member is FieldMember {
  return member.kind === 'field'
}

function findFieldMember<N extends FieldMember = FieldMember>(
  node: Omit<ObjectFormNode, '_allMembers'>,
  name: string,
): N | undefined {
  return node.members.filter(isFieldMember).find((m) => m.name === name) as N | undefined
}

export function PageSectionInput(props: ObjectInputProps): React.JSX.Element {
  const {
    level,
    onChange,
    path,
    renderField: renderFieldProp,
    renderInput,
    renderItem,
    renderPreview,
    value,
  } = props
  const symbolFieldMember = findFieldMember(props, 'symbol')
  const refEditState = useReferenceEditState(value?.['symbol']?._ref)
  const symbolValue = refEditState?.draft || refEditState?.published || undefined
  const symbolValueRef = useRef(symbolValue)

  const symbolAction = useMemo(
    () =>
      defineDocumentFieldAction({
        name: 'unlock',
        useAction(actionProps): DocumentFieldActionItem {
          const relativeFieldPath = actionProps.path.slice(path.length)
          const fieldSegment = relativeFieldPath[0]
          const isOverridden =
            typeof fieldSegment === 'string' && value?.[fieldSegment] !== undefined

          return {
            type: 'action',
            disabled: fieldSegment !== 'string' || symbolValue?.[fieldSegment] === undefined,
            onAction() {
              if (typeof fieldSegment !== 'string') {
                return
              }

              if (isOverridden) {
                onChange(unset(relativeFieldPath))
              } else {
                onChange(set(symbolValue?.[fieldSegment] || '', relativeFieldPath))
              }
            },
            icon: isOverridden ? RevertIcon : EditIcon,
            title: isOverridden ? 'Revert to symbol value' : 'Edit to override',
            renderAsButton: true,
          }
        },
      }),
    [onChange, path, symbolValue, value],
  )

  useEffect(() => {
    symbolValueRef.current = symbolValue
  }, [symbolValue])

  const renderField = useCallback(
    (fieldProps: Omit<FieldProps, 'renderDefault'>) => {
      return renderFieldProp({
        ...fieldProps,
        actions: (fieldProps.actions || []).concat(symbolValue ? [symbolAction] : []),
      })
    },
    [renderFieldProp, symbolAction, symbolValue],
  )

  return (
    <Stack space={5}>
      {symbolFieldMember && (
        <Card padding={4} style={{margin: '-20px -20px -20px'}}>
          <ObjectInputMember
            member={symbolFieldMember}
            renderField={renderFieldProp}
            renderInput={renderInput}
            renderItem={renderItem}
            renderPreview={renderPreview}
          />
        </Card>
      )}

      <FormFieldSet inputId="" level={level + 1} title="Overrides">
        {props.members.map((mem) => {
          if (isFieldMember(mem) && mem.name === 'symbol') {
            return null
          }

          if (mem.kind === 'field') {
            return (
              <ObjectInputMember
                key={mem.key}
                member={{
                  ...mem,
                  field: {
                    ...mem.field,
                    readOnly: Boolean(symbolValue) && mem.field.value === undefined,
                    value: mem.field.value ?? symbolValue?.[mem.name],
                  },
                }}
                renderField={renderField}
                renderInput={renderInput}
                renderItem={renderItem}
                renderPreview={renderPreview}
              />
            )
          }

          return (
            <ObjectInputMember
              key={mem.key}
              member={mem}
              renderField={renderField}
              renderInput={renderInput}
              renderItem={renderItem}
              renderPreview={renderPreview}
            />
          )
        })}
      </FormFieldSet>

      <Code hidden language="json" size={0}>
        {JSON.stringify(symbolValue || null, null, 2)}
      </Code>
    </Stack>
  )
}
