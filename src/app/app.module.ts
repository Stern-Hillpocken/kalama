import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { RoadMapComponent } from './pages/road-map/road-map.component';
import { BattleMapComponent } from './pages/battle-map/battle-map.component';
import { HomeStatusComponent } from './components/feature/home-status/home-status.component';
import { HomeSettingsComponent } from './components/ui/home/home-settings/home-settings.component';
import { HomeChoicesComponent } from './components/ui/home/home-choices/home-choices.component';
import { HomeTitleComponent } from './components/ui/home/home-title/home-title.component';
import { RoadMapStatusComponent } from './components/feature/road-map-status/road-map-status.component';
import { BattleMapStatusComponent } from './components/feature/battle-map-status/battle-map-status.component';
import { LoadoutStatusComponent } from './components/feature/loadout-status/loadout-status.component';
import { LoadoutComponent } from './pages/loadout/loadout.component';
import { LoadoutConfirmComponent } from './components/ui/loadout/loadout-confirm/loadout-confirm.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoadMapComponent,
    BattleMapComponent,
    HomeStatusComponent,
    HomeSettingsComponent,
    HomeChoicesComponent,
    HomeTitleComponent,
    RoadMapStatusComponent,
    BattleMapStatusComponent,
    LoadoutStatusComponent,
    LoadoutComponent,
    LoadoutConfirmComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
