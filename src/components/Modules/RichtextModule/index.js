import { stegaClean } from '@sanity/client/stega';
import RichText from '@/components/RichText';
import styles from '@/styles/components/RichText.module.scss';

export default function RichtextModule({
  content,
  align,
  values,
  dataAttribute
}) {
  return (
    // Documents written before the field existed have no `align`; undefined is start.
    <div
      className={styles.richtext}
      data-align={stegaClean(align) === 'center' ? 'center' : undefined}>
      <RichText
        value={content}
        values={values}
        dataAttribute={dataAttribute?.scope('content')}
      />
    </div>
  );
}
