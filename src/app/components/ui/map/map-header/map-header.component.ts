import { Component, Input } from '@angular/core';
import { GameState } from 'src/app/models/game-state.model';
import { MapPin } from 'src/app/models/map-pin.model';
import { MapPinService } from 'src/app/shared/map-pin.service';

@Component({
  selector: 'app-map-header',
  templateUrl: './map-header.component.html',
  styleUrls: ['./map-header.component.scss']
})
export class MapHeaderComponent {

  @Input()
  gameState!: GameState;

  allPins: MapPin = new MapPin([],[],[],[]);

  constructor(
    private mapPinService: MapPinService
  ){}

  ngOnInit(): void {
    this.allPins = this.mapPinService.getAllPins();
  }

}
