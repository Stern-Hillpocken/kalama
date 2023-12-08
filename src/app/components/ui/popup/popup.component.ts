import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopupMessage } from 'src/app/models/popup-message.model';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  @Input()
  popupMessage!: PopupMessage;

  @Output()
  popupClickEmitter: EventEmitter<void> = new EventEmitter();

  popupClick(): void {
    this.popupClickEmitter.emit();
  }

}
