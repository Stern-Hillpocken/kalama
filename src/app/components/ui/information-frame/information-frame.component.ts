import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-information-frame',
  templateUrl: './information-frame.component.html',
  styleUrls: ['./information-frame.component.scss']
})
export class InformationFrameComponent {

  @Input()
  informationFrame!: any;

  @Input()
  isCostDisplayed!: boolean;

  @Input()
  gameDisplaySubtype!: string;

  close(): void {
    this.informationFrame = {};
  }

}
