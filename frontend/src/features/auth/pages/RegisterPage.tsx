import { RegisterForm } from '../components/RegisterForm';
import { IconBuildingSkyscraper } from '@tabler/icons-react';

export function RegisterPage() {
  return (
    <div className="card glass-surface p-4 p-md-5 shadow-lg border-0">
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-3 bg-primary-subtle text-primary mb-3">
          <IconBuildingSkyscraper size={28} />
        </div>
        <h2 className="card-title h2 mb-1 fw-bold tracking-tight">Provision New Workspace</h2>
        <p className="text-secondary small mb-0">
          Set up an isolated multi-tenant environment with capacity & AI reasoning engine.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}

export default RegisterPage;
