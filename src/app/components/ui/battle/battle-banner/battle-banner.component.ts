import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-battle-banner',
  templateUrl: './battle-banner.component.html',
  styleUrls: ['./battle-banner.component.scss']
})
export class BattleBannerComponent {

  @Input()
  gameStateStatus!: string;
  

  displayStatus(tag: string): string {
    switch (this.gameStateStatus) {
      case "preparation": return tag === 'h1' ? "Préparation" : "Placez vos constructions";
      case "player": return tag === 'h1' ? "À vous de jouer" : "Faites une action";
      case "upkeep": return tag === 'h1' ? "Compteurs" : "De tour de jeu, de ko, de pouvoir";
      case "buildings": return tag === 'h1' ? "Bâtiments" : "Récolte de ceux présents";
      case "towers": return tag === 'h1' ? "Tours" : "Activation de leur séquence";
      case "enemies": return tag === 'h1' ? "Ennemies" : "Déplacement ou attaque";
      case "spawn": return tag === 'h1' ? "Apparition" : "De nouveaux ennemis, ou pas";
      default: return tag === 'h1' ? "! Erreur !" : "Dans battle-banner, displayStatus()";
    }
  }
}
