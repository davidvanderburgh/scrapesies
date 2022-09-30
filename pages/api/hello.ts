import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import path from 'path';
import fs, { WriteStream } from 'fs';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<string[]>
): Promise<void> => {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  const fileNames: string[] = [];

  page
    .on('response', async (response: HTTPResponse) => {
      const url: string = response.url();
      if (response.request().resourceType() === 'image') {
        response.buffer().then((file: Buffer) => {
          const fileName: string = url.split('/').pop() ?? '';
          const filePath: string = `./public/images/${fileName}`;
          const writeStream: WriteStream = fs.createWriteStream(filePath);
          writeStream.write(file);
          fileNames.push(fileName);
        });
      }
    });
  await page.goto('https://www.ipdb.org/');
  await browser.close();
  res.status(200).json(fileNames);
}

export default handler;