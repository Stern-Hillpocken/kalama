import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { HomeSettingsComponent } from './components/ui/home/home-settings/home-settings.component';
import { HomeChoicesComponent } from './components/ui/home/home-choices/home-choices.component';
import { HomeTitleComponent } from './components/ui/home/home-title/home-title.component';
import { LoadoutConfirmComponent } from './components/ui/loadout/loadout-confirm/loadout-confirm.component';
import { GameComponent } from './pages/game/game.component';
import { GameMapComponent } from './components/feature/game-map/game-map.component';
import { GameBattleComponent } from './components/feature/game-battle/game-battle.component';
import { HomeDisplayComponent } from './components/feature/home-display/home-display.component';
import { ErrorComponent } from './pages/error/error.component';
import { HomeLoadoutComponent } from './components/ui/home/home-loadout/home-loadout.component';
import { BattleSpawnStripComponent } from './components/ui/battle/battle-spawn-strip/battle-spawn-strip.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomeSettingsComponent,
    HomeChoicesComponent,
    HomeTitleComponent,
    LoadoutConfirmComponent,
    GameComponent,
    GameMapComponent,
    GameBattleComponent,
    HomeDisplayComponent,
    ErrorComponent,
    HomeLoadoutComponent,
    BattleSpawnStripComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }