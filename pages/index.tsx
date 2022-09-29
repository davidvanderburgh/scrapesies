import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import axios, { AxiosResponse } from 'axios';

export default function Web () {
  const [isImagesFetched, setIsImagesFetched] = useState<boolean>(false);
  const [imageNames, setImageNames] = useState<string[]>([]);

  const fetchImages = async () => {
    if (!isImagesFetched) {
      const response: AxiosResponse<string[]> = await axios.get('/api/hello');
      setIsImagesFetched(true);
      setImageNames(response.data);
    }
  };

  useEffect(() => {
    fetchImages();
  });

  return isImagesFetched
    ? 
      <div>
        {
          imageNames.map(
            (image: string, index: number) => <img key={index} src={`/images/${image}`} alt="info" layout='fill'></img>
          )
        }
      </div>
    :
      <span>Loading Images</span>;
}
