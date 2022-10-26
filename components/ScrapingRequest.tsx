import axios, { AxiosResponse } from 'axios';
import { ChangeEvent, Dispatch, FormEvent, ReactElement, useState } from 'react';
import styles from '@/styles/ScrapingRequest.module.scss';
import { ImageScrapingResults } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDispatch } from 'react-redux';
import { AnyAction } from '@reduxjs/toolkit';
import { setImageScrapings } from '@/store/imageScrapings';

export const ScrapingRequest = (): ReactElement => {
  const [urlToScrape, setUrlToScrape] = useState<string>('http://www.google.com');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch: Dispatch<AnyAction> = useDispatch();

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    dispatch(setImageScrapings({ images: [], errors: [] }));
    const response: AxiosResponse<ImageScrapingResults> = await axios.get(
      '/api/scrapefiles',
      { 
        params: { urlToScrape },
        validateStatus: () => true,
      },
    );
    setIsLoading(false);
    dispatch(setImageScrapings(response.data));
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
};