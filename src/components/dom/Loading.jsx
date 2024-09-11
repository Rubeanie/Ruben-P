import styles from '@/styles/components/Canvas.module.scss';

export function Loading() {
  return (
    <div className={styles.loading}>
      <svg fill='none' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  );
}
