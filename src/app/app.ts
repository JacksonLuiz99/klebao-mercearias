import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeedService } from './services/seed.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class App {
  constructor() {
    inject(SeedService).inicializar();
  }
}
