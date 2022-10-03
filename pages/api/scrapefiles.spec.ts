import { downloadImage, imageScrapingRequestHandler, scrubFileName } from '@/pages/api/scrapefiles';
import { ImageScrapingResults, Image, ImageScrapingError } from '@/types';
import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';

jest.mock('crypto');
jest.mock('puppeteer');

describe(scrubFileName, () => {
  describe('happy path', () => {
    const someFileName = 'some_file_name.ext';

    it('returns a normal file name', () => {
      expect(scrubFileName(someFileName)).toEqual(someFileName);
    });

    it('returns a shortened file name if the length of the name is too long', () => {
      const someReallyLongFileName: string = `${new Array(40).fill('a').join('')}.ext`;
      const someUUUID = 'some_uuid';
      (randomUUID as jest.Mock).mockReturnValueOnce(someUUUID);
      expect(scrubFileName(someReallyLongFileName)).toEqual(`${someUUUID}.ext`);
    });

    it('removes any encoded characters', () => {
      const someFileNameWithEncoding = 'some_file_%20name.ext';
      expect(scrubFileName(someFileNameWithEncoding)).toEqual(someFileName);
    });

    it('removes query params from the end of file names', () => {
      const someFileNameWithQueryParams = 'some_file_name.ext?param=asdf';
      expect(scrubFileName(someFileNameWithQueryParams)).toEqual(someFileName);
    });
  });

  describe('sad path', () => {
    it('throws an exception if there is no extension', () => {
      const someFileName = 'some_file_name';
      expect(() => scrubFileName(someFileName)).toThrow(new Error(`no file extension`, { cause: someFileName }));
    });

    it('throws an exception if the extension is invalid', () => {
      const someFileName = 'some_file_name.invalid';
      expect(() => scrubFileName(someFileName)).toThrow(new Error(`invalid file extension .invalid`, { cause: someFileName }));
    });
  });
});

describe(downloadImage, () => {
  const mockResourceType = jest.fn();
  const someBuffer = Buffer.from('some_buffer');
  const someFileName = 'some_file_name.ext';
  const someExtension = 'ext';
  const someUrl = `some_url/${someFileName}`;
  const someResponse: HTTPResponse = {
    request: () => ({
      resourceType: () => mockResourceType(),
    }),
    buffer: async () => someBuffer,
    url: () => someUrl,
  } as HTTPResponse;
  let someImageScrapingResults: ImageScrapingResults;

  beforeEach(() => {
    someImageScrapingResults = {
      images: [],
      errors: [],
    } as ImageScrapingResults;
  });

  describe('happy path', () => {  
    beforeEach(async () => {
      mockResourceType.mockReturnValueOnce('image');
      await downloadImage({ response: someResponse, imageScrapingResults: someImageScrapingResults });
    });

    it('checks the resource type of the response request', async () => {
      expect(mockResourceType).toHaveBeenCalled();
    });

    it('adds the image buffer to the image scraping results', () => {
      expect(someImageScrapingResults.images).toEqual(expect.arrayContaining<Image>([
        {
          data: someBuffer,
          extension: someExtension,
          name: someFileName,
        },
      ]));
    });
  });

  describe('sad path', () => {
    describe('resource is not an image', () => {
      it('does not modify the image scraping results', async () => {
        mockResourceType.mockReturnValueOnce('some_other_type');
        await downloadImage({ response: someResponse, imageScrapingResults: someImageScrapingResults });
        expect(someImageScrapingResults).toEqual<ImageScrapingResults>({
          images: [],
          errors: [],
        });
      });
    });

    describe('failure to get the image', () => {
      it('adds an error to the image scraping results', async () => {
        mockResourceType.mockReturnValueOnce('image');
        const mockBuffer = jest.fn();
        const someBadResponse: HTTPResponse = {
          ...someResponse,
          buffer: () => mockBuffer(),
        } as HTTPResponse;
        const someError = new Error('some_error', { cause: someFileName });

        mockBuffer.mockRejectedValueOnce(someError);
        await downloadImage({ response: someBadResponse, imageScrapingResults: someImageScrapingResults });
        expect(someImageScrapingResults.errors).toEqual(expect.arrayContaining<ImageScrapingError>([
          {
            message: 'failed to get image',
            reason: someError.message,
            file: someFileName,
          }
        ]));
      });
    });
  });
});

describe(imageScrapingRequestHandler, () => {
  const someUrl = 'some_url';
  const someRequest: NextApiRequest = {
    query: {
      urlToScrape: someUrl,
    } as Partial<{[key: string]: string | string[]}>,
  } as NextApiRequest;
  const mockStatus = jest.fn();
  const mockJson = jest.fn();
  const someResponse: NextApiResponse<ImageScrapingResults> = {
    status (statusCode: number) {
      mockStatus(statusCode);
      return this;
    },
    json: (body: ImageScrapingResults) => {
      mockJson(body);
    },
  } as NextApiResponse<ImageScrapingResults>;
  const mockOn = jest.fn();
  const mockGoto = jest.fn();
  const somePage: Page = {
    on<K extends keyof puppeteer.PageEventObject>(
      eventName: K,
      handler: (event: puppeteer.PageEventObject[K]) => void,
    ) {
      mockOn(eventName, handler);
    },
    goto: (
      url: string,
      options?: (puppeteer.WaitForOptions & { referer?: string | undefined}),
    ) => mockGoto(url, options),
  } as Page;
  const mockNewPage = jest.fn();
  const mockClose = jest.fn();
  const someBrowser: Browser = {
    newPage: () => mockNewPage(),
    close: () => mockClose(),
  } as Browser;

  describe('happy path', () => {

    beforeEach(async () => {
      (puppeteer.launch as jest.Mock).mockResolvedValueOnce(someBrowser);
      mockNewPage.mockResolvedValueOnce(somePage);
      await imageScrapingRequestHandler(someRequest, someResponse);
    });
    
    it('launches puppeteer', () => {
      expect(puppeteer.launch).toHaveBeenCalled();
    });

    it('opens a new virtual page', () => {
      expect(mockNewPage).toHaveBeenCalled();
    });

    it('registers a response listener for the page', () => {
      expect(mockOn).toHaveBeenCalledWith('response', expect.any(Function));
    });

    it('goes to the scraping page and waits for idle activity', () => {
      expect(mockGoto).toHaveBeenCalledWith(someUrl, { waitUntil: 'networkidle2' });
    });

    it('closes the browser', () => {
      expect(mockClose).toHaveBeenCalled();
    });

    it('sends 200 status', () => {
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('sends the image scraping results as json', () => {
      expect(mockJson).toHaveBeenCalledWith({ images: [], errors: [] });
    });
  });

  describe('sad path', () => {
    describe('could not go to url', () => {
      const someError = new Error('some_error');
      
      beforeEach(async () => {
        (puppeteer.launch as jest.Mock).mockResolvedValueOnce(someBrowser);
        mockNewPage.mockResolvedValueOnce(somePage);
        mockGoto.mockRejectedValueOnce(someError);
        await imageScrapingRequestHandler(someRequest, someResponse);
      });
      
      it('sends the scraping results', async () => {
        expect(mockJson).toHaveBeenCalledWith({ images: [], errors: expect.arrayContaining<ImageScrapingError>([
          { message: 'failed to go to url', reason: someError.message },
        ])});
      });

      it('sends a 500 status', () => {
        expect(mockStatus).toHaveBeenCalledWith(500);
      });
    });
  });
});
