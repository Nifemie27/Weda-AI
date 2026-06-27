import { APP_NAME, DEVELOPER_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {APP_NAME}. Built by {DEVELOPER_NAME}.
        </p>
        <p>Powered by OpenWeatherMap &amp; AI</p>
      </div>
    </footer>
  );
}
