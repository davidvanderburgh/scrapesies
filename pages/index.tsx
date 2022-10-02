import { useState } from 'react';
import { ImageScrapingResults } from '@/types';
import { ScrapingResults } from '@/components/ScrapingResults';
import { ScrapingRequest } from '@/components/ScrapingRequest';

export const HomePage = () => {
  const [imageScrapingResults, setImageScrapingResults] =
    useState<ImageScrapingResults>({ images: [], errors: [] });

  return (
    <div>
      <ScrapingRequest setImageScrapingResults={setImageScrapingResults} />
      <ScrapingResults imageScrapingResults={imageScrapingResults} />
    </div>
  );
};

export default HomePage;