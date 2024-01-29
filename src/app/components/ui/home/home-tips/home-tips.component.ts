import { Component } from '@angular/core';

@Component({
  selector: 'app-home-tips',
  templateUrl: './home-tips.component.html',
  styleUrls: ['./home-tips.component.scss']
})
export class HomeTipsComponent {

  tipIndex!: number;

  allTips: string[] = ["Séquence d’activation : vous > constructions > ennemis.", "Les constructions détruites le sont seulement durant le combat.", "Plus vous mettez du temps à finir le combat, plus vous aurez de temps pour récupérer des ressources.", "Avant d’aller à l’abris ou chez le marchand, regardez les prix (Afficher tous les équipements)."];

  ngOnInit(): void {
    this.generateNewTip();
  }

  generateNewTip(): void {
    this.tipIndex = Math.floor(Math.random() * (this.allTips.length));
    setTimeout(() => this.generateNewTip(), 2500);
  }

}
