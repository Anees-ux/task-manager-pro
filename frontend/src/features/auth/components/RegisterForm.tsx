import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schema';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@stores/authStore';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      setUser({
        id: response.userId || 'user-new',
        username: response.username,
        email: response.email,
        token: response.token,
        tenantId: response.tenantId,
        role: response.role || 'Admin',
      });

      toast.success('Workspace provisioned successfully! 🚀', { duration: 4000 });
      navigate('/', { replace: true });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        'Registration failed. Please check your details.';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Registration failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      {/* Username */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">
          Organization / Admin Username
        </label>
        <div className="input-icon">
          <span className="input-icon-addon">
            <IconUser size={18} />
          </span>
          <input
            type="text"
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
            placeholder="e.g. acme_admin"
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

      {/* Work Email */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">
          Work Email Address
        </label>
        <div className="input-icon">
          <span className="input-icon-addon">
            <IconMail size={18} />
          </span>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="admin@company.com"
            disabled={isSubmitting}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <div className="d-flex align-items-center gap-1 text-danger small mt-1">
            <IconAlertCircle size={14} />
            <span>{errors.email.message}</span>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary">
          Master Password
        </label>
        <div className="input-icon">
          <span className="input-icon-addon">
            <IconLock size={18} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            placeholder="••••••••"
            disabled={isSubmitting}
            {...register('password')}
          />
          <span
            className="input-icon-addon cursor-pointer"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={() => setShowPassword(!showPassword)}
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
        {/* Subtle Password Checklist */}
        {passwordValue && (
          <div className="d-flex gap-3 small text-secondary mt-2 ps-1">
            <span className={passwordValue.length >= 6 ? 'text-success' : 'text-muted'}>
              <IconCheck size={14} className="me-1" /> 6+ chars
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label className="form-label small fw-semibold text-secondary">
          Confirm Master Password
        </label>
        <div className="input-icon">
          <span className="input-icon-addon">
            <IconLock size={18} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            placeholder="••••••••"
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && (
          <div className="d-flex align-items-center gap-1 text-danger small mt-1">
            <IconAlertCircle size={14} />
            <span>{errors.confirmPassword.message}</span>
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
              <span>Provisioning Workspace...</span>
            </>
          ) : (
            <>
              <span>Launch Enterprise Workspace</span>
              <IconArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Bottom Switch Link */}
      <div className="text-center text-secondary small mt-4 pt-2 border-top border-secondary-subtle">
        Already have a workspace?{' '}
        <Link to="/login" className="text-primary fw-semibold text-decoration-none">
          Sign In
        </Link>
      </div>
    </form>
  );
}
