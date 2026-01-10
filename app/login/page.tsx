import AcmeLogo from '@/app/ui/acme-logo';
import BisLogo from '@/app/ui/bis-logo';
import LoginForm from '@/app/ui/login-form';

export default function Login() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      {/* Logo más cerca al formulario */}
      <div className="mb-0 max-w-[600px]"> {/* Reducimos el margen inferior */}
        <AcmeLogo/>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-[400px] min-w-min p-4"> {/* min-w-min para establecer limite */}
        <LoginForm />
      </div>
    </main>
  );
}
