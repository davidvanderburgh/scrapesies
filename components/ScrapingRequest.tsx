import axios, { AxiosResponse } from 'axios';
import { ChangeEvent, Dispatch, FormEvent, ReactElement, SetStateAction, useState } from 'react';
import styles from '@/styles/ScrapingRequest.module.scss';
import { ImageScrapingResults } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type ScrapingRequestProps = {
  setImageScrapingResults: Dispatch<SetStateAction<ImageScrapingResults>>,
}

export const ScrapingRequest = (
  { setImageScrapingResults }: ScrapingRequestProps,
): ReactElement => {
  const [urlToScrape, setUrlToScrape] = useState<string>('http://www.google.com');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    setImageScrapingResults({ images: [], errors: [] });
    const response: AxiosResponse<ImageScrapingResults> = await axios.get(
      '/api/scrapefiles',
      { 
        params: { urlToScrape },
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
    </div>
  )
}