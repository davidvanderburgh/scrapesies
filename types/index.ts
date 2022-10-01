export type ImageScrapingError = {
  message: string,
  reason: string,
  file?: string,
}

export type ImageScrapingResults = {
  imageNames: string[],
  errors: ImageScrapingError[],
}