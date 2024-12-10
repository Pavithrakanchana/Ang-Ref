import { Component, OnInit } from '@angular/core';
import { QuoteDataService } from 'src/app/services/quote-data.service';

@Component({
  selector: 'app-retrieve-quote',
  templateUrl: './retrieve-quote.component.html',
  styleUrls: ['./retrieve-quote.component.scss']
})
export class RetrieveQuoteComponent implements OnInit {
  data:any;
  constructor(private auoteDataService: QuoteDataService) { }

  ngOnInit(): void {
    this.data = this.auoteDataService.getData();
  }

}
