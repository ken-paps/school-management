import { useEffect, useState } from 'react';
import { Wand2, Copy, Check, Shield } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'student',
};

export default function UserModal({
  open,
  onClose,
  onSubmit,
  user = null,
  generatePassword,
}) {
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(user);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEdit && user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'student',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setGeneratedPassword('');
    setCopied(false);
  }, [open, isEdit, user]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  };

  const handleGeneratePassword = async () => {
    try {
      const pwd = await generatePassword();
      setGeneratedPassword(pwd);
      setField('password', pwd);
      setCopied(false);
    } catch (err) {
      setErrors((e) => ({ ...e, password: err.message }));
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
    };
    if (form.password) payload.password = form.password;

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const backendErrors = err?.response?.data?.errors || {};
      const flat = {};
      Object.entries(backendErrors).forEach(([key, val]) => {
        flat[key] = Array.isArray(val) ? val[0] : val;
      });
      if (Object.keys(flat).length === 0) {
        flat._general = err.message || 'Failed to save user.';
      }
      setErrors(flat);
    } finally {
      setSubmitting(false);
    }
  };

  const isSelf = isEdit && currentUser?.id === user?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit user' : 'Create user'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._general && (
          <div className="rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {errors._general}
          </div>
        )}

        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Jane Doe"
          error={errors.name}
          autoFocus
          required
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="name@school.test"
          error={errors.email}
          required
        />

        <Select
          label="Role"
          value={form.role}
          onChange={(e) => setField('role', e.target.value)}
          options={ROLE_OPTIONS}
          error={errors.role}
          disabled={isSelf}
          hint={isSelf ? "You can't change your own role." : 'Determines what the user can access.'}
        />

        <div>
          <div className="flex items-end justify-between mb-1.5 gap-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isEdit ? 'New password' : 'Password'}
              {isEdit && (
                <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            {!isEdit && (
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                <Wand2 size={12} /> Generate
              </button>
            )}
          </div>

          <Input
            type="text"
            value={form.password}
            onChange={(e) => {
              setField('password', e.target.value);
              setGeneratedPassword('');
            }}
            placeholder={isEdit ? 'Leave blank to keep current' : 'Set a password for the user'}
            error={errors.password}
            autoComplete="new-password"
          />

          {generatedPassword && (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-medium">
                  Generated password
                </div>
                <div className="mt-0.5 font-mono text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {generatedPassword}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {!isEdit && !generatedPassword && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Minimum 8 characters. Hand this to the user after creating.
            </p>
          )}
        </div>

        {!isEdit && (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2.5 flex gap-2">
            <Shield size={14} className="shrink-0 mt-0.5 text-zinc-500 dark:text-zinc-400" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The user will be created with{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">must change password</span>{' '}
              flagged. They'll be prompted to set their own on first login (enforcement coming in a later phase).
            </p>
          </div>
        )}

        {/* Actions inside the form */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}