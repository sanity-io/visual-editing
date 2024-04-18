import {FieldMember, ObjectMember} from 'sanity'

/** @alpha */
export function isFieldMember(member: ObjectMember): member is FieldMember {
  return member.kind === 'field'
}
