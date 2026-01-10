import { montserrat } from './ui/font';
import './ui/global.css';
import { UserProvider } from './api/UserContext';  // Asegúrate de importar el UserProvider correctamente

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        {/* Envuelve el contenido en el UserProvider para que todos los componentes hijos tengan acceso al contexto de usuario */}
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
