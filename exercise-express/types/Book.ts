import { Format } from "./enums/Format";
import { Status } from "./enums/Status";

class Book {
  private title: string;
  private author: string;
  private numberOfPages: number;
  private status: Status;
  private price: number;
  private numberOfPagesRead: number;
  private format: Format;
  private finished: boolean;

  constructor(
    title: string,
    author: string,
    numberOfPages: number,
    status: Status,
    price: number,
    format: Format
  ) {
    this.title = title;
    this.author = author;
    this.numberOfPages = numberOfPages;
    this.status = status;
    this.price = price;
    this.numberOfPagesRead = 0;
    this.format = format;
    this.finished = false;
  }

  setNumberOfPagesRead(pagesRead: number): void {
    if (pagesRead >= this.numberOfPages) {
      this.numberOfPagesRead = this.numberOfPages;
      this.finished = true;
      this.status = Status.Read;
    } else {
      this.numberOfPagesRead = pagesRead;
    }
  }

  getCurrentlyAt(): number {
    return this.numberOfPagesRead;
  }

  getReadingPercentage(): number {
    if (this.numberOfPages === 0) return 0;
    return Math.round((this.numberOfPagesRead / this.numberOfPages) * 100);
  }

  deleteBook(): void {
    // Implementation for deleting the book can be added here
  }
}

export { Book };
