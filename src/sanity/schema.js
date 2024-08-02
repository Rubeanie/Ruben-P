import {blockContentType} from './schemas/blockContentType'
import {categoryType} from './schemas/documents/categoryType'
import {postType} from './schemas/documents/postType'
import {authorType} from './schemas/documents/authorType'

export const schema = {
  types: [blockContentType, categoryType, postType, authorType],
}
