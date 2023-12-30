import { Injectable } from '@angular/core';
import { MapPin } from '../models/map-pin.model';
import { MapState } from '../models/map-state.model';

@Injectable({
  providedIn: 'root'
})
export class MapPinService {

  private allPins: MapPin = new MapPin([],[],[],[],[],[]);

  private spotNames: string[] = ["La plaine hurlante", "La montagne protectrice", "Le canyon troglodyte", "Sables mouvants", "Hammeau étape", "Ferme isolée", "Fort souterrain", "Rocher d’observation", "Racines affleurantes", "Débris de surface", "Balise cardinale", "La porte solaire"];

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
    let nameCount: number = Math.floor(Math.random() * (5 - 3 + 1)) + 3;
    for (let i = 0; i < nameCount; i++) {
        let name: string = this.spotNames[Math.floor(Math.random() * this.spotNames.length)];
        while (this.allPins.spotName.includes(name)) {
            name = this.spotNames[Math.floor(Math.random() * this.spotNames.length)];
        }
        this.allPins.spotName.push(name);
        let top: number = this.rand();
        while (this.isTextPositionTooClose(top)) {
            top = this.rand();
        }
        this.allPins.spotPosition.push([top,this.rand()]);
    }
  }

  isTextPositionTooClose(topProposal: number): boolean {
    let gap: number = 10;
    for (let i = 0; i < this.allPins.spotPosition.length; i++) {
        if (topProposal-gap < this.allPins.spotPosition[i][0] && topProposal+gap > this.allPins.spotPosition[i][0]) return true;
    }
    return false;
  }

}
