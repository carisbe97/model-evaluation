import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JudgeSessionService } from '../services/judge-session.service';

/**
 * Guard funcional que valida la presencia de un nombre de juez activo antes de acceder
 * al menú de categorías, paneles de evaluación o resultados.
 */
export const judgeNameGuard: CanActivateFn = (route, state) => {
  const judgeSession = inject(JudgeSessionService);
  const router = inject(Router);

  if (judgeSession.isAuthenticated()) {
    return true;
  }

  // Si no hay nombre de juez, redirigir a la pantalla de bienvenida con la URL de retorno
  return router.createUrlTree(['/welcome'], {
    queryParams: { returnUrl: state.url }
  });
};
