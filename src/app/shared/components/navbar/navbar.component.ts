import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { JudgeSessionService } from '../../../core/services/judge-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly judgeSession = inject(JudgeSessionService);
  private readonly router = inject(Router);

  onExitJudgeSession(): void {
    if (confirm('¿Deseas cambiar o salir de la sesión del juez actual?')) {
      this.judgeSession.clearJudgeSession();
      this.router.navigate(['/welcome']);
    }
  }
}
