import { ReactElement, useState } from 'react';
import styles from '@/styles/ScrapingResults.module.scss';
import { Image, ImageScrapingError, ImageScrapingResults } from '@/types';
import { saveAs }  from 'file-saver';
import Zip from 'jszip';

export type ScrapingResultsProps = {
  imageScrapingResults: ImageScrapingResults,
}

const downloadImages = async (imageScrapingResults: ImageScrapingResults): Promise<void> => {
  const zip = new Zip();
  for (const image of imageScrapingResults.images) {
    zip.file(image.name, Buffer.from(image.data));
  }
  const zipContent: Blob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, 'images.zip');
}

const getImageSrc = (image: Image): string =>
  `data:image${image.extension === 'svg' ? '/svg+xml' : ''};base64,${Buffer.from(image.data).toString('base64')}`;

const ScrapingImages = ({ imageScrapingImages }: { imageScrapingImages: Image[] }): ReactElement => (
  <>
    {
      imageScrapingImages.map((image: Image, index: number) =>
        <picture
          key={index}
          className={styles.successfulImageResult}
        >
          <img
            title={image.name}
            alt={image.name}
            src={getImageSrc(image)}
          />
          <p>{image.name}</p>
        </picture>
      )
    }
  </>
);

const ScrapingErrors = ({ imageScrapingErrors }: { imageScrapingErrors: ImageScrapingError[]}): ReactElement => (
  <>
    {
      imageScrapingErrors.length !== 0 &&
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
              imageScrapingErrors.map((result: ImageScrapingError, index: number ) =>
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
  </>
);

export const ScrapingResults = ({ imageScrapingResults }: ScrapingResultsProps): ReactElement => (
  <div className={styles.scrapingResultsContainer}>
    <button
      className={styles.downloadAllButton}
      onClick={() => downloadImages(imageScrapingResults)}
    >Download All</button>
    <ScrapingImages imageScrapingImages={imageScrapingResults.images} />
    <ScrapingErrors imageScrapingErrors={imageScrapingResults.errors} />
  </div>
);
