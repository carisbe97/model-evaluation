import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /**
   * Lista reactiva de notificaciones activas
   */
  readonly toasts = signal<ToastMessage[]>([]);

  private timers = new Map<string, any>();

  /**
   * Muestra una notificación con opciones personalizables
   */
  show(message: string, type: ToastType = 'info', duration: number = 4000, title?: string): string {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newToast: ToastMessage = { id, type, message, duration, title };

    this.toasts.update(list => [...list, newToast]);

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.remove(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  private resolveParams(durationOrTitle?: number | string, title?: string): { duration: number; title?: string } {
    if (typeof durationOrTitle === 'string') {
      return { duration: 4000, title: durationOrTitle };
    }
    return { duration: typeof durationOrTitle === 'number' ? durationOrTitle : 4000, title };
  }

  /**
   * Notificación de éxito
   */
  success(message: string, title?: string): string;
  success(message: string, duration?: number, title?: string): string;
  success(message: string, durationOrTitle?: number | string, title?: string): string {
    const { duration, title: finalTitle } = this.resolveParams(durationOrTitle, title);
    return this.show(message, 'success', duration, finalTitle);
  }

  /**
   * Notificación de error
   */
  error(message: string, title?: string): string;
  error(message: string, duration?: number, title?: string): string;
  error(message: string, durationOrTitle?: number | string, title?: string): string {
    const { duration, title: finalTitle } = this.resolveParams(durationOrTitle, title);
    return this.show(message, 'error', duration, finalTitle);
  }

  /**
   * Notificación informativa
   */
  info(message: string, title?: string): string;
  info(message: string, duration?: number, title?: string): string;
  info(message: string, durationOrTitle?: number | string, title?: string): string {
    const { duration, title: finalTitle } = this.resolveParams(durationOrTitle, title);
    return this.show(message, 'info', duration, finalTitle);
  }

  /**
   * Notificación de advertencia
   */
  warning(message: string, title?: string): string;
  warning(message: string, duration?: number, title?: string): string;
  warning(message: string, durationOrTitle?: number | string, title?: string): string {
    const { duration, title: finalTitle } = this.resolveParams(durationOrTitle, title);
    return this.show(message, 'warning', duration, finalTitle);
  }

  /**
   * Remueve una notificación por su identificador
   */
  remove(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  /**
   * Limpia todas las notificaciones activas
   */
  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.toasts.set([]);
  }
}
