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
      S.documentTypeListItem('page').title('Pages').icon(MdAutoAwesomeMotion),
      S.documentTypeListItem('page.portfolio').title('Portfolio posts'),
      S.documentTypeListItem('portfolio.category').title('Portfolio categories'),
      S.divider(),
      S.documentTypeListItem('announcement').title('Announcements'),
      S.documentTypeListItem('navigation').title('Navigation'),
      S.documentTypeListItem('redirect').title('Redirects'),
      S.divider(),
      group(S, 'Miscellaneous', [
        S.documentTypeListItem('theme').title('Themes')
      ]).icon(MdMiscellaneousServices)
    ]);

export default structure;
