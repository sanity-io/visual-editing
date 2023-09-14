import { FieldMember, ObjectFormNode } from 'sanity'

import { isFieldMember } from './isFieldMember'

/** @alpha */
export function findFieldMember<N extends FieldMember = FieldMember>(
  node: Omit<ObjectFormNode, '_allMembers'>,
  name: string,
): N | undefined {
  return node.members.filter(isFieldMember).find((m) => m.name === name) as
    | N
    | undefined
}
