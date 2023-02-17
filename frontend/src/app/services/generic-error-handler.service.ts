import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {LaravelErrorExtractorService} from './laravel-error-extractor.service';

@Injectable({
  providedIn: 'root'
})
export class GenericErrorHandlerService {

  constructor(
    private toastr: ToastrService
  ) {
  }

  handleError(error: any, defaultMessage: string = 'An error occurred') {
    let errorMessages = LaravelErrorExtractorService.extractErrorMessagesFromErrorResponse(error);

    if (errorMessages.length > 0) {
      errorMessages.forEach((errorMessage) => {
        this.toastr.error(errorMessage);
      });
    } else if (error.message) {
      this.toastr.error(error.message);
    } else {
      this.toastr.error(defaultMessage);
    }
  }
}
