import { Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  title = 'VOGUE ELITE - Model Evaluation';
  private router = inject(Router);
  private sub: Subscription;
  isEvaluationRoute = signal<boolean>(false);

  constructor() {
    this.sub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.updateRoute(event.urlAfterRedirects);
    });
    this.updateRoute(this.router.url);
  }

  private updateRoute(url: string): void {
    const isEval = url.includes('/evaluation');
    this.isEvaluationRoute.set(isEval);
    if (typeof document !== 'undefined') {
      if (isEval) {
        document.body.classList.add('evaluation-mode');
      } else {
        document.body.classList.remove('evaluation-mode');
      }
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (typeof document !== 'undefined') {
      document.body.classList.remove('evaluation-mode');
    }
  }
}
