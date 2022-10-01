import { ReactElement } from 'react';
import styles from '../styles/ScrapingResults.module.scss';
import { ImageScrapingError, ImageScrapingResults } from '../types';

type ScrapingResultsProps = {
  imageScrapingResults: ImageScrapingResults,
}

export const ScrapingResults = ({ imageScrapingResults }: ScrapingResultsProps): ReactElement => (
  <div className={styles.scrapingResultsContainer}>
    {
      imageScrapingResults.imageNames.map((image: string, index: number) =>
        <picture className={styles.successfulImageResult} key={index} title={image}>
          <img
            alt={image}
            src={`/images/${image}`}
          />
          <p>{image}</p>
        </picture>
      )
    }
    {
      imageScrapingResults.errors.length !== 0 &&
        <table className={styles.imageScrapingResultsErrorTable}>
          <thead>
            <tr>
              <th>Message</th>
              <th>Reason</th>
              <th>File?</th>
            </tr>
          </thead>
          <tbody>
            {
              imageScrapingResults.errors.map((result: ImageScrapingError, index: number ) =>
                <tr key={index}>
                  <td>{result.message}</td>
                  <td>{result.reason}</td>
                  <td>{result.file}</td>
                </tr>
              )
            }
          </tbody>
        </table>
    }
  </div>
);
