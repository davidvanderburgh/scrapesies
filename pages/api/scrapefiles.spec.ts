import { downloadImage, imageScrapingRequestHandler, scrubFileName } from "@/pages/api/scrapefiles";
import { randomUUID } from 'crypto';

jest.mock('crypto');

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
  it('')
});

describe(imageScrapingRequestHandler, () => {

});
