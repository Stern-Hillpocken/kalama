import { Component, Input } from '@angular/core';
import { Bubble } from 'src/app/models/bubble.model';
import { BubbleService } from 'src/app/shared/bubble.service';

@Component({
  selector: 'app-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss']
})
export class BubbleComponent {

  @Input()
  bubble!: Bubble;

  constructor(
    private bubbleService: BubbleService
  ){}

  ngAfterViewInit(): void {
    this.move();
  }

  move(): void {
    let width: number = this.bubble.width/100;
    setTimeout(() => {
      if (this.bubble.x < this.bubble.xEnd) this.bubble.x += width;
      else if (this.bubble.x > this.bubble.xEnd) this.bubble.x -= width;
      if (this.bubble.y < this.bubble.yEnd) this.bubble.y += width;
      else if (this.bubble.y > this.bubble.yEnd) this.bubble.y -= width;

      if (Math.abs(this.bubble.x - this.bubble.xEnd) >= width || Math.abs(this.bubble.y - this.bubble.yEnd) >= width) this.move();
      else this.bubbleService.removeBubble();
    }, 10);
  }

}
