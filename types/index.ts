export type ImageScrapingError = {
  message: string,
  reason: string,
  file?: string,
}

export type Image = {
  name: string,
  extension: string,
  data: Buffer,
}

export type ImageScrapingResults = {
  images: Image[],
  errors: ImageScrapingError[],
}