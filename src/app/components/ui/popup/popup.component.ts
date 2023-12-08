import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopupMessage } from 'src/app/models/popup-message.model';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  @Input()
  popupMessage!: PopupMessage[];

  @Output()
  closePopupEmitter: EventEmitter<void> = new EventEmitter();

  slideDisplayed: number = 0;

  popupChange(move: string): void {
    if (move === "next") {
      this.slideDisplayed ++;
      if (this.slideDisplayed >= this.popupMessage.length) this.closePopupEmitter.emit();
    } else {
      this.slideDisplayed --;
      if (this.slideDisplayed < 0) this.slideDisplayed = 0;
    }
  }

}
