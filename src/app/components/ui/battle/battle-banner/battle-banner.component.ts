import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-battle-banner',
  templateUrl: './battle-banner.component.html',
  styleUrls: ['./battle-banner.component.scss']
})
export class BattleBannerComponent {

  @Input()
  gameStateStatus!: string;
  

  displayStatus(): string {
    switch (this.gameStateStatus) {
      case "preparation": return "Préparation";
      case "player": return "À vous de jouer";
      case "upkeep": return "Compteurs";
      case "buildings": return "Bâtiments";
      case "towers": return "Tours";
      case "enemies": return "Ennemies";
      case "spawn": return "Apparition";
      default: return "! Erreur !"
    }
  }
}
