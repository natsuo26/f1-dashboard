import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SHEEP_NAV_BAR, SheepThemeSwitcherComponent } from '@sheep-ng/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SHEEP_NAV_BAR, SheepThemeSwitcherComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
