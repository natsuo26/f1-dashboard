import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SHEEP_CHIP } from '@sheep-ng/ui';
import { yearsAvailable } from '@core';

/** Chip row of seasons with data (2023 → now); each chip links to `base/:year`. */
@Component({
  selector: 'app-year-picker',
  imports: [RouterLink, SHEEP_CHIP],
  templateUrl: './year-picker.html',
  styleUrl: './year-picker.scss',
})
export class YearPicker {
  readonly base = input.required<string>();
  readonly year = input.required<number>();
  protected readonly years = yearsAvailable();
}
