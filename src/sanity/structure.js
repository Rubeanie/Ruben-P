import { singleton, group } from './utils';
import {
  MdSettingsSuggest,
  MdAutoAwesomeMotion,
  MdMiscellaneousServices
} from 'react-icons/md';

const structure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      singleton(S, 'site', 'Site Settings').icon(MdSettingsSuggest),
      S.divider(),
      S.documentTypeListItem('page.post').title('Posts'),
      S.documentTypeListItem('post.category').title('Post categories'),
      S.divider(),
      S.documentTypeListItem('page').title('Pages').icon(MdAutoAwesomeMotion),
      S.divider(),
      S.documentTypeListItem('navigation').title('Navigation'),
      S.documentTypeListItem('redirect').title('Redirects'),
      S.documentTypeListItem('announcement').title('Announcements'),
      S.divider(),
      group(S, 'Miscellaneous', [
        S.documentTypeListItem('author').title('Authors'),
        S.documentTypeListItem('skill').title('Skills'),
        S.documentTypeListItem('social').title('Socials'),
        S.documentTypeListItem('theme').title('Themes')
      ]).icon(MdMiscellaneousServices)
    ]);

export default structure;
