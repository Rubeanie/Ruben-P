import styles from '@/styles/components/Logo.module.scss';

// The CMS mark, already sanitised by the caller.
export default function Logo({ svg }) {
  return (
    <span className={styles.logo} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
