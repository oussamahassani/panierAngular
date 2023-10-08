import { Injectable } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';

@Injectable()
export class MessageService {
  private toastrConfig: Partial<IndividualConfig> = {
    timeOut: 3000, // Set the duration for which the toastr will be displayed
    progressBar: false, // Display a progress bar
    closeButton: false, // Display a close button
    positionClass: 'toast-top-right', // Position of the toastr
    enableHtml: true, // Enable HTML in the toastr message
    toastClass: 'ngx-toastr-custom', // Custom CSS class for the toastr
  };


  constructor(private toastr: ToastrService) {}

  public add(message: string): void {
    this.toastr.success(message, 'Message:', this.toastrConfig);
  }

  public addError(message: string): void {
    this.toastr.error(message, 'Message:', this.toastrConfig);
  }
}
