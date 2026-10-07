import { stegaClean } from '@sanity/client/stega';
import styles from '@/styles/components/Spacer.module.scss';

export default function Spacer({ size }) {
  return (
    <div
      className={styles.spacer}
      data-size={stegaClean(size)}
      aria-hidden='true'
    />
  );
}
