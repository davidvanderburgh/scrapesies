import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import { randomUUID } from 'crypto';
import { ImageScrapingResults } from '@/types';

export const scrubFileName = (fileName: string): string => {
  let result = fileName.replaceAll(/%[0-9]+/gm, '').split('?')[0];
  const fileExtension: string = result.slice(result.lastIndexOf('.') + 1);
  if (fileExtension === result) {
    throw Error(`no file extension`, { cause: fileName });
  }
  if (fileExtension.length > 4) {
    throw Error(`invalid file extension .${fileExtension}`, { cause: fileName });
  }

  if (result.length > 30) {
    result = `${randomUUID()}.${fileExtension}`;
  }

  return result;
};

export const downloadImage = async (options: {
  response: HTTPResponse,
  imageScrapingResults: ImageScrapingResults,
}): Promise<void> => {
  const { response, imageScrapingResults } = options;
  if (response.request().resourceType() !== 'image') {
    return;
  }
  try {
    const imageBuffer: Buffer = await response.buffer();
    const fileName: string = scrubFileName(response.url().split('/').pop() ?? '');
    const fileExtension: string = fileName.slice(fileName.lastIndexOf('.') + 1);
    imageScrapingResults.images.push({ name: fileName, extension: fileExtension, data: imageBuffer });
  } catch(error) {
    imageScrapingResults.errors.push({
      message: 'failed to get image',
      reason: (error as Error).message,
      file: ((error as Error).cause as string),
    });
  }
};

export const imageScrapingRequestHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ImageScrapingResults>
): Promise<void> => {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  const imageScrapingResults: ImageScrapingResults = {
    images: [],
    errors: [],
  };

  page.on(
    'response',
    async (response: HTTPResponse) => downloadImage({ response, imageScrapingResults }),
  );

  try {
    await page.goto(req.query.urlToScrape as string, { waitUntil: 'networkidle2'});
    await browser.close();
    res.status(200).json(imageScrapingResults);
  } catch (error) {
    imageScrapingResults.errors.push({
      message: 'failed to go to url',
      reason: (error as Error).message,
    });
    res.status(500).json(imageScrapingResults);
  }
};

export default imageScrapingRequestHandler;