export const __tag = Symbol('__tag')

export type TagType = string

export type WithTag<Tag extends TagType> = {
  [__tag]: Tag
}

export type Tagged<Tag extends TagType, Payload extends object> = WithTag<Tag> & Payload

export const tagged = <Tag extends TagType, Payload extends object>(
  tag: Tag,
  payload: Payload
): Tagged<Tag, Payload> => ({
  [__tag]: tag,
  ...payload,
})

export const checkTag = <Tag extends TagType, Payload extends object>(
  t: Tagged<TagType, Payload>,
  tag: Tag
): t is Tagged<Tag, Payload> => t[__tag] === tag

export const matchTagged = <Tag extends TagType, Payload extends object, R>(
  t: Tagged<TagType, Payload>,
  tag: Tag,
  handler: (p: Tagged<Tag, Payload>) => R
) => {
  if (checkTag(t, tag)) {
    handler(t)
    return true
  }
  return false
}
