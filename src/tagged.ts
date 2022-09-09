export const __tag = Symbol('__tag')

export type TagType = string
export type PayloadType = Readonly<Record<string, unknown>>

export type WithTag<Tag extends TagType> = {
  readonly [__tag]: Tag
}

export type Tagged<
  Tag extends TagType,
  Payload extends PayloadType
> = WithTag<Tag> & Payload

export const tagged = <Tag extends TagType, Payload extends PayloadType>(
  tag: Tag,
  payload: Payload
): Tagged<Tag, Payload> => ({
  [__tag]: tag,
  ...payload,
})
