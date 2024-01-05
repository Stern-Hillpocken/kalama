import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

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
import { BattleConstructionsComponent } from './components/ui/battle/battle-constructions/battle-constructions.component';
import { BattleGridComponent } from './components/ui/battle/battle-grid/battle-grid.component';
import { BattleCharacterComponent } from './components/ui/battle/battle-character/battle-character.component';
import { PopupComponent } from './components/ui/popup/popup.component';
import { InformationFrameComponent } from './components/ui/information-frame/information-frame.component';
import { MapChoicesComponent } from './components/ui/map/map-choices/map-choices.component';
import { MapHudComponent } from './components/ui/map/map-hud/map-hud.component';
import { MapHeaderComponent } from './components/ui/map/map-header/map-header.component';
import { HomeBackgroundComponent } from './components/ui/home/home-background/home-background.component';
import { GameCampComponent } from './components/feature/game-camp/game-camp.component';

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
    BattleSpawnStripComponent,
    BattleConstructionsComponent,
    BattleGridComponent,
    BattleCharacterComponent,
    PopupComponent,
    InformationFrameComponent,
    MapChoicesComponent,
    MapHudComponent,
    MapHeaderComponent,
    HomeBackgroundComponent,
    GameCampComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
