import S from '@sanity/desk-tool/structure-builder'
import sanityClient from 'part:@sanity/base/client'

import { Copy, Gift, Sliders, ShoppingCart, LinkBreak } from 'phosphor-react'

import { standardViews } from './previews/standard'

const collectionsMenu = S.listItem()
  .title('Collections')
  .icon(Gift)
  .child()

const productsMenu = S.listItem()
  .title('Products')
  .icon(Gift)
  .child()

const productVariantsMenu = S.listItem()
  .title('Product Variants')
  .icon(Copy)
  .child()

const filtersMenu = S.listItem()
  .title('Filters')
  .icon(Sliders)
  .child()

// Our exported "Shop" Menu
export const shopMenu = S.listItem()
  .title('Shop')
  .id('shop')
  .child(
    S.list()
      .title('Shop')
      .items([
        productsMenu,
        productVariantsMenu,
        S.divider(),
        collectionsMenu,
        filtersMenu
      ])
  )
  .icon(ShoppingCart)
