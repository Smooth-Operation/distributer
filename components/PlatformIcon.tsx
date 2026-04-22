import type { Platform } from "@/lib/mockAds";

export function PlatformIcon({ platform, className = "" }: { platform: Platform; className?: string }) {
  switch (platform) {
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15h-2.4v-3H10V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.95c5.05-.5 9-4.76 9-9.95z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "TikTok":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M19.3 6.7c-1.7-.4-3-1.6-3.6-3.2h-3v13.3c0 1.3-1 2.4-2.3 2.4S8 18.2 8 16.9s1-2.4 2.3-2.4c.3 0 .5 0 .7.1v-3c-.2 0-.5-.1-.7-.1-3 0-5.3 2.4-5.3 5.3s2.4 5.3 5.3 5.3 5.3-2.4 5.3-5.3V9.4c1.2.8 2.6 1.3 4 1.4V7.7c-.1 0-.2 0-.3-.1v-.9z" />
        </svg>
      );
    case "Google":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8z" />
          <path fill="#34A853" d="M12 23c3 0 5.4-1 7.3-2.7l-3.6-2.7c-1 .7-2.3 1.1-3.7 1.1-2.8 0-5.2-1.9-6-4.5H2.3V16c1.8 3.6 5.5 7 9.7 7z" />
          <path fill="#FBBC05" d="M6 14.2c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2V7H2.3C1.5 8.5 1 10.2 1 12s.5 3.5 1.3 5l3.7-2.8z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 15 1 12 1 7.8 1 4.1 4.4 2.3 8l3.7 2.8c.8-2.6 3.2-4.4 6-4.4z" />
        </svg>
      );
    case "Pinterest":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9.2-.8 1.2-5 1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.6-4.4-3.1 0-5 2.3-5 4.8 0 1 .4 2 .8 2.5.1.1.1.2.1.3-.1.3-.2 1.1-.3 1.2 0 .2-.2.3-.3.2-1.2-.6-2-2.4-2-3.8 0-3.1 2.2-5.9 6.5-5.9 3.4 0 6 2.4 6 5.7 0 3.4-2.1 6.1-5.1 6.1-1 0-2-.5-2.3-1.1l-.6 2.4c-.2.9-.8 2-1.2 2.7.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
        </svg>
      );
  }
}
