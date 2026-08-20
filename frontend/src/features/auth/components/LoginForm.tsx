import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  IconUser,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle,
  IconSparkles,
} from '@tabler/icons-react';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@stores/authStore';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data);
      
      setUser({
        id: response.userId || 'user-1',
        username: response.username,
        email: response.email,
        token: response.token,
        tenantId: response.tenantId,
        role: response.role || 'Admin',
      });

      toast.success(`Welcome back, ${response.username}! 👋`, {
        icon: '🚀',
      });

      navigate('/', { replace: true });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        'Authentication failed. Please check your credentials.';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Invalid credentials provided.');
    }
  };

  const handleFillDemo = () => {
    setValue('username', 'admin_user', { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
    toast('Demo credentials auto-filled', { icon: '✨' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Quick Demo Credentials Pill */}
      <div className="mb-4 d-flex justify-content-between align-items-center p-2 rounded-3 bg-primary-subtle border border-primary-subtle">
        <div className="d-flex align-items-center gap-2 text-primary small">
          <IconSparkles size={16} />
          <span>Quick testing mode</span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="btn btn-sm btn-ghost-primary px-2 py-0 fs-5 fw-medium"
        >
          Auto-fill Demo
        </button>
      </div>

      {/* Username Field */}
      <div className="mb-3">
        <label className="form-label d-flex justify-content-between small fw-semibold text-secondary">
          <span>Username</span>
        </label>
        <div className="input-icon">
          <span className="input-icon-addon">
            <IconUser size={18} />
          </span>
          <input
            type="text"
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
            placeholder="e.g. admin_user"
            autoComplete="username"
            disabled={isSubmitting}
            {...register('username')}
          />
        </div>
        {errors.username && (
          <div className="d-flex align-items-center gap-1 text-danger small mt-1">
            <IconAlertCircle size={14} />
            <span>{errors.username.message}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label small fw-semibold text-secondary mb-0">
            Password
          </label>
          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              toast('Password reset available in enterprise settings', { icon: '🔒' });
            }}
            className="small text-muted text-decoration-none"
          >
            Forgot password?
          </a>
        </div>
        <div className="input-icon">
          <span className="input-icon-addon">
            <IconLock size={18} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register('password')}
          />
          <span
            className="input-icon-addon cursor-pointer"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </span>
        </div>
        {errors.password && (
          <div className="d-flex align-items-center gap-1 text-danger small mt-1">
            <IconAlertCircle size={14} />
            <span>{errors.password.message}</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="form-footer mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2 py-2"
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <IconArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Bottom Switch Link */}
      <div className="text-center text-secondary small mt-4 pt-2 border-top border-secondary-subtle">
        Don't have a workspace yet?{' '}
        <Link to="/register" className="text-primary fw-semibold text-decoration-none">
          Create Workspace
        </Link>
      </div>
    </form>
  );
}
