import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <Footer />
    </>
  );
}
