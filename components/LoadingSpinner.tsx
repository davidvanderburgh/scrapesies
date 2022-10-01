import { ReactElement } from 'react';
import styles from '../styles/LoadingSpinner.module.css';

export const LoadingSpinner = (): ReactElement => (
  <>
    <div className={styles.loadingSpinnerBackground}>
      <div className={styles.ldsRing}>
        <div className={styles.ldsRingDiv}/>
        <div className={styles.ldsRingDiv}/>
        <div className={styles.ldsRingDiv}/>
        <div className={styles.ldsRingDiv}/>
      </div>
    </div>
  </>
)