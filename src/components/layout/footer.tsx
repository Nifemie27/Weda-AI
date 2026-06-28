import { APP_NAME, DEVELOPER_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 mt-auto bg-white/20 dark:bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {APP_NAME}. Built by {DEVELOPER_NAME}.
        </p>
        <p>Powered by OpenWeatherMap &amp; AI</p>
      </div>
    </footer>
  );
}
