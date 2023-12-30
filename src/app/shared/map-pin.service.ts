import { Injectable } from '@angular/core';
import { MapPin } from '../models/map-pin.model';
import { MapState } from '../models/map-state.model';

@Injectable({
  providedIn: 'root'
})
export class MapPinService {

  private allPins: MapPin = new MapPin([],[],[],[]);

  constructor() { }

  getAllPins(): MapPin {
    return this.allPins;
  }

  rand(): number {
    return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
  }

  initAllPins(mapState: MapState): void {
    for (let i = 0; i < mapState.battleCount; i++) {
        this.allPins.battlePosition.push([this.rand(),this.rand()]);
    }
    for (let i = 0; i < mapState.campCount; i++) {
        this.allPins.campPosition.push([this.rand(),this.rand()]);
    }
    for (let i = 0; i < mapState.eliteCount; i++) {
        this.allPins.elitePosition.push([this.rand(),this.rand()]);
    }
    for (let i = 0; i < mapState.sellerCount; i++) {
        this.allPins.sellerPosition.push([this.rand(),this.rand()]);
    }
  }

}
