import { LoginForm } from '../components/LoginForm';
import { IconShieldCheck } from '@tabler/icons-react';

export function LoginPage() {
  return (
    <div className="card glass-surface p-4 p-md-5 shadow-lg border-0">
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-3 bg-primary-subtle text-primary mb-3">
          <IconShieldCheck size={28} />
        </div>
        <h2 className="card-title h2 mb-1 fw-bold tracking-tight">Sign in to your account</h2>
        <p className="text-secondary small mb-0">
          Enter your organization credentials to access the intelligent execution engine.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}

export default LoginPage;
