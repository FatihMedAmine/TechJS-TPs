import { Format } from "./enums/Format";
import { Status } from "./enums/Status";

class Book {
    private title: string;
    private author: string;
    private numberOfPages: number;
    private status : Status;
    private price: number;
    private numberOfPagesRead = 0;
    private format: Format;
    private finished: boolean = false;

    constructor(title: string, author: string, numberOfPages: number, status: Status, price: number, format: Format) {
        this.title = title;
        this.author = author;
        this.numberOfPages = numberOfPages;
        this.status = status;
        this.price = price;
        this.format = format;
    }
}