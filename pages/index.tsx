import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import axios, { AxiosResponse } from 'axios';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Web () {
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [urlToScrape, setUrlToScrape] = useState<string>('http://www.google.com');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setImageNames([]);
    const response: AxiosResponse<string[]> = await axios.get(
      '/api/scrapefiles',
      { params: { urlToScrape: urlToScrape } },
    );
    setImageNames(response.data);
    setIsLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
      <input type="submit" value="Submit"/>
    </form>
    {isLoading
      ?
        <>
          <LoadingSpinner />
          <span>loading man...</span>
        </>
      :
        <span/>
    }
    <div className={styles.imagesContainer}>
      {
        imageNames.map((image: string, index: number) =>
          <picture id={styles.picture} key={index} title={image}>
            <img
              alt={image}
              src={`/images/${image}`}
            />
            <p>{image}</p>
          </picture>
        )
      }
    </div>
  </div>
  );
}
