import { stegaClean } from '@sanity/client/stega';
import RichText from '@/components/RichText';
import uid from '@/lib/uid';
import styles from '@/styles/components/RichText.module.scss';

export default function RichtextModule({
  content,
  align,
  values,
  dataAttribute,
  lead,
  ...props
}) {
  return (
    // Documents written before the field existed have no `align`; undefined is start.
    <div
      id={uid(props)}
      className={styles.richtext}
      data-reveal-children='blocks'
      data-align={stegaClean(align) === 'center' ? 'center' : undefined}>
      <RichText
        value={content}
        values={values}
        dataAttribute={dataAttribute?.scope('content')}
        lead={lead}
      />
    </div>
  );
}
