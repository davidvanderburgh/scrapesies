import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import fs, { WriteStream } from 'fs';
import { randomUUID } from 'crypto';

const scrubFileName = (fileName: string): string => {
  let result = fileName.replaceAll(/%[0-9]+/gm, '').split('?')[0];
  const fileExtension: string = result.slice(result.lastIndexOf('.') + 1);
  if (fileExtension === result) {
    throw Error('no file extension');
  }
  if (fileExtension.length > 4) {
    throw Error('invalid file extension');
  }

  if (result.length > 30) {
    result = `${randomUUID()}.${fileExtension}`;
  }

  return result;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<string[]>
): Promise<void> => {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  const fileNames: string[] = [];

  page
    .on('response', async (response: HTTPResponse) => {
      try {
        if (response.request().resourceType() === 'image') {
          const imageBuffer: Buffer = await response.buffer();
          const fileName: string = scrubFileName(response.url().split('/').pop() ?? '');
          const filePath: string = `./public/images/${fileName}`;
          const writeStream: WriteStream = fs.createWriteStream(filePath);
          writeStream.write(imageBuffer);
          fileNames.push(fileName);
        }
      } catch(error) {
        console.log('failed to write file', (error as Error).message);
      }
    });

  console.log('going to', req.query.urlToScrape);
  await page.goto(req.query.urlToScrape as string, { waitUntil: 'networkidle2'});
  await browser.close();
  res.status(200).json(fileNames);
}

export default handler;