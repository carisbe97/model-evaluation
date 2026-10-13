import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  private clientInstance: SupabaseClient | null = null;
  public readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      environment.supabaseUrl &&
      !environment.supabaseUrl.includes('your-project') &&
      environment.supabaseAnonKey &&
      !environment.supabaseAnonKey.includes('your-anon-key')
    );

    if (this.isConfigured) {
      try {
        const cleanUrl = environment.supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
        this.clientInstance = createClient(cleanUrl, environment.supabaseAnonKey.trim());
      } catch (e) {
        console.warn('Error inicializando SupabaseClient. Se usará fallback local.', e);
        this.clientInstance = null;
      }
    }
  }

  get client(): SupabaseClient | null {
    return this.clientInstance;
  }
}
