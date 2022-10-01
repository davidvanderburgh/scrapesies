import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import fs, { WriteStream } from 'fs';
import { randomUUID } from 'crypto';
import { ImageScrapingResults } from '@/types';

const scrubFileName = (fileName: string): string => {
  let result = fileName.replaceAll(/%[0-9]+/gm, '').split('?')[0];
  const fileExtension: string = result.slice(result.lastIndexOf('.') + 1);
  if (fileExtension === result) {
    throw Error(`no file extension`, { cause: fileName });
  }
  if (fileExtension.length > 4) {
    throw Error(`invalid file extension ${fileExtension}`, { cause: fileName });
  }

  if (result.length > 30) {
    result = `${randomUUID()}.${fileExtension}`;
  }

  return result;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ImageScrapingResults>
): Promise<void> => {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  const imageScrapingResults: ImageScrapingResults = {
    imageNames: [],
    errors: [],
  };

  page
    .on('response', async (response: HTTPResponse) => {
      try {
        if (response.request().resourceType() === 'image') {
          const imageBuffer: Buffer = await response.buffer();
          const fileName: string = scrubFileName(response.url().split('/').pop() ?? '');
          const filePath: string = `./public/images/${fileName}`;
          const writeStream: WriteStream = fs.createWriteStream(filePath);
          writeStream.write(imageBuffer);
          imageScrapingResults.imageNames.push(fileName);
        }
      } catch(error) {
        imageScrapingResults.errors.push({
          message: 'failed to write file',
          reason: (error as Error).message,
          file: ((error as Error).cause as string),
        });
      }
    });

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

export default handler;