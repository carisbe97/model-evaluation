import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { JudgeSessionService } from '../../core/services/judge-session.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  readonly judgeSession = inject(JudgeSessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  judgeName = '';
  hasError = signal(false);
  errorMessage = signal('Por favor ingrese su nombre para identificarse en el acta.');
  isLoading = signal(false);
  feedbackMessage = signal<{ text: string; type: 'success' | 'info' } | null>(null);


  async onStartEvaluation(): Promise<void> {
    const cleanName = this.judgeName.trim().toUpperCase();
    if (!cleanName) {
      this.hasError.set(true);
      this.errorMessage.set('Por favor ingrese su nombre para identificarse en el acta.');
      return;
    }

    this.judgeName = cleanName;

    this.hasError.set(false);
    this.isLoading.set(true);
    this.feedbackMessage.set(null);

    try {
      // 1. Validar si existe en la BD o crearlo, y obtener sus evaluaciones
      const result = await this.judgeSession.loginJudge(cleanName);

      if (!result.esNuevo) {
        const total = result.evaluaciones.length;
        if (total > 0) {
          this.feedbackMessage.set({
            text: `¡Bienvenido de vuelta, ${result.juez.nombre}! Hemos recuperado ${total} evaluación(es) previas.`,
            type: 'success'
          });
        } else {
          this.feedbackMessage.set({
            text: `¡Bienvenido de vuelta, ${result.juez.nombre}! Accediendo a tu panel...`,
            type: 'info'
          });
        }
      } else {
        this.feedbackMessage.set({
          text: `¡Perfil registrado con éxito! Bienvenido al panel oficial, ${result.juez.nombre}.`,
          type: 'success'
        });
      }

      // 2. Transición suave tras retroalimentación visual
      setTimeout(() => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/categories';
        this.router.navigateByUrl(returnUrl);
      }, 700);

    } catch (err: any) {
      console.error('Error en el ingreso del juez:', err);
      this.hasError.set(true);
      this.errorMessage.set(err?.message || 'No fue posible iniciar la sesión. Intente nuevamente.');
      this.isLoading.set(false);
    }
  }
}
