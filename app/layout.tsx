import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';

export const metadata = {
  title: 'BPMN Editor',
  description: 'Create and edit BPMN diagrams with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
