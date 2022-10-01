import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import styles from '../styles/Home.module.scss';
import axios, { AxiosResponse } from 'axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ImageScrapingResults } from '../types';
import { ScrapingResults } from '../components/ScrapingResults';

export default function Web () {
  const [imageScrapingResults, setImageScrapingResults] =
    useState<ImageScrapingResults>({ imageNames: [], errors: [] });
  const [urlToScrape, setUrlToScrape] = useState<string>('http://www.google.com');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setImageScrapingResults({ imageNames: [], errors: [] });
    const response: AxiosResponse<ImageScrapingResults> = await axios.get(
      '/api/scrapefiles',
      { 
        params: { urlToScrape: urlToScrape },
        validateStatus: () => true,
      },
    );
    setImageScrapingResults(response.data);
    setIsLoading(false);
  };

  return (
    <div>
      <form className={styles.scrapingForm} onSubmit={handleSubmit}>
        <label>
          Url to scrape:
          <input
            id="urlToScrape"
            name="urlToScrape"
            type="text"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setUrlToScrape(event.target.value)}
            value={urlToScrape}
          />
        </label>
        <div>
          {isLoading
            ? <LoadingSpinner />
            : <input type="submit" value="Submit"/>
          }
        </div>  
      </form>
      <ScrapingResults imageScrapingResults={imageScrapingResults} />
    </div>
  );
}
