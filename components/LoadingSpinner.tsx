import { ReactElement } from 'react';
import styles from '@/styles/LoadingSpinner.module.scss';

export const LoadingSpinner = (): ReactElement => (
  <>
    <div className={styles.loadingSpinnerBackground}>
      <div className={styles.loadingSpinnerRing}>
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  </>
)