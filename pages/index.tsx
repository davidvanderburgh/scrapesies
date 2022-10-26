import { ScrapingResults } from '@/components/ScrapingResults';
import { ScrapingRequest } from '@/components/ScrapingRequest';
import { Provider } from 'react-redux';
import { store } from '@/store';

export const HomePage = () => {
  return (
    <Provider store={store}>
      <ScrapingRequest />
      <ScrapingResults />
    </Provider>
  );
};

export default HomePage;