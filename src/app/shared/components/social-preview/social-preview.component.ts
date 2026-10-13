import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => Promise<void>;
        createTweet: (tweetId: string, targetEl: HTMLElement, options?: any) => Promise<HTMLElement>;
      };
    };
  }
}

export type SocialPlatform = 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'generic';

@Component({
  selector: 'app-social-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-preview.component.html',
  styleUrl: './social-preview.component.scss'
})
export class SocialPreviewComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) url: string = '';
  @Input() candidateName: string = '';
  @Input() candidateAvatar: string = '';

  @ViewChild('twitterContainer') twitterContainer?: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);

  copied = signal(false);
  isTwitterWidgetLoading = signal(false);
  hasTwitterWidgetLoaded = signal(false);

  platform = computed<SocialPlatform>(() => {
    const raw = (this.url || '').toLowerCase();
    if (raw.includes('twitter.com') || raw.includes('x.com')) return 'twitter';
    if (raw.includes('instagram.com')) return 'instagram';
    if (raw.includes('tiktok.com')) return 'tiktok';
    if (raw.includes('youtube.com') || raw.includes('youtu.be')) return 'youtube';
    return 'generic';
  });

  handle = computed<string>(() => {
    const raw = (this.url || '').trim();
    if (!raw) return '';

    try {
      const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        // En caso de /status/1234
        if (parts[0] === 'status' || parts[1] === 'status') {
          return parts[0] === 'status' ? 'post' : parts[0];
        }
        return parts[0].replace('@', '');
      }
      return parsed.hostname;
    } catch {
      return raw.replace(/https?:\/\//, '').split('/')[0] || '';
    }
  });

  tweetId = computed<string | null>(() => {
    const raw = (this.url || '').trim();
    const match = raw.match(/\/status(?:es)?\/(\d+)/i);
    return match ? match[1] : null;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url'] && !changes['url'].firstChange) {
      this.initWidget();
    }
  }

  ngAfterViewInit(): void {
    this.initWidget();
  }

  copyLink(): void {
    if (!this.url) return;
    if (isPlatformBrowser(this.platformId) && navigator?.clipboard) {
      navigator.clipboard.writeText(this.url).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      }).catch(() => {});
    }
  }

  private initWidget(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.platform() === 'twitter') {
      this.loadTwitterEmbed();
    }
  }

  private loadTwitterEmbed(): void {
    if (!this.twitterContainer) return;
    const container = this.twitterContainer.nativeElement;
    container.innerHTML = ''; // Limpiar previo

    this.isTwitterWidgetLoading.set(true);
    this.hasTwitterWidgetLoaded.set(false);

    this.ensureTwitterScript().then(() => {
      const id = this.tweetId();
      if (id && window.twttr?.widgets?.createTweet) {
        // Embed de Tweet específico
        window.twttr.widgets.createTweet(id, container, {
          theme: 'dark',
          align: 'center',
          dnt: true
        }).then(el => {
          this.isTwitterWidgetLoading.set(false);
          if (el) {
            this.hasTwitterWidgetLoaded.set(true);
          }
        }).catch(() => {
          this.isTwitterWidgetLoading.set(false);
        });
      } else if (window.twttr?.widgets?.load) {
        // Timeline o enlace de perfil
        const timelineLink = document.createElement('a');
        timelineLink.className = 'twitter-timeline';
        timelineLink.setAttribute('data-theme', 'dark');
        timelineLink.setAttribute('data-height', '260');
        timelineLink.setAttribute('data-chrome', 'noheader nofooter noborders transparent noscrollbar');
        timelineLink.setAttribute('data-dnt', 'true');
        timelineLink.href = this.url;
        timelineLink.textContent = `Publicaciones de @${this.handle()}`;

        container.appendChild(timelineLink);
        window.twttr.widgets.load(container).then(() => {
          this.isTwitterWidgetLoading.set(false);
          // Verificar si Twitter generó el iframe
          setTimeout(() => {
            const iframe = container.querySelector('iframe');
            if (iframe) {
              this.hasTwitterWidgetLoaded.set(true);
            }
          }, 800);
        }).catch(() => {
          this.isTwitterWidgetLoading.set(false);
        });
      }
    }).catch(() => {
      this.isTwitterWidgetLoading.set(false);
    });
  }

  private ensureTwitterScript(): Promise<void> {
    if (window.twttr) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const existing = document.getElementById('twitter-wjs');
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => resolve();
      script.onerror = () => resolve(); // no bloquear si falla por adblock
      document.body.appendChild(script);
    });
  }
}
