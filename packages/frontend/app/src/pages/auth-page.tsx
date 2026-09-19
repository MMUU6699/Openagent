import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GithubDuotoneIcon, GoogleDuotoneIcon } from '@blocksuite/icons/rc';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth';
import { LanguageSelect } from './settings';

export function safeReturnPath(value: string | null) {
  return value &&
    /^\/(?!\/)/.test(value) &&
    !value.includes('\\') &&
    !/^\/(sign-in|sign-up|onboarding|oauth)([/?#]|$)/.test(value)
    ? value
    : '/chats';
}

export function SignInPage({ initialStep }: { initialStep?: string }) {
  const signup = initialStep === 'register';
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const destination = safeReturnPath(params.get('redirect'));
  const auth = useAuthStore();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState(
    params.has('error')
      ? 'OAuth sign-in could not be completed. Please try again.'
      : ''
  );
  const [providers, setProviders] = useState<string[] | null>(null);
  const [busyProvider, setBusyProvider] = useState('');
  useEffect(() => {
    let active = true;
    auth.clearError();
    auth.refreshSession().finally(() => {
      if (active) setReady(true);
    });
    fetch('/api/oauth/providers')
      .then(async response => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (active) setProviders(data.providers);
      })
      .catch(() => {
        if (active) {
          setProviders([]);
          setError('Unable to load sign-in providers. Please retry.');
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (ready && auth.user && !auth.isLoading)
      navigate(destination, { replace: true });
  }, [ready, auth.user, auth.isLoading, destination, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (signup && password !== confirmation) {
      setError('Passwords do not match');
      return;
    }
    try {
      if (signup) await auth.register(email.trim(), password);
      else await auth.signInPassword(email.trim(), password);
      navigate(destination, { replace: true });
    } catch {
      setError(
        signup
          ? 'Unable to create account. The email may already be registered.'
          : 'Unable to sign in. Check your email and password.'
      );
    }
  }
  async function oauth(provider: 'Google' | 'GitHub') {
    if (busyProvider) return;
    setError('');
    setBusyProvider(provider);
    try {
      const nonce = crypto.randomUUID();
      sessionStorage.setItem('oauth-client-nonce', nonce);
      const response = await fetch('/api/oauth/preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          client: 'web',
          client_nonce: nonce,
          redirect_uri: destination,
        }),
      });
      if (!response.ok) throw new Error();
      const { url } = await response.json();
      const target = new URL(url);
      if (
        target.protocol !== 'https:' ||
        !['accounts.google.com', 'github.com'].includes(target.hostname)
      )
        throw new Error();
      window.location.assign(target.href);
    } catch {
      setError('OAuth sign-in could not be completed. Please try again.');
      setBusyProvider('');
    }
  }
  return (
    <main className="auth-shell">
      <aside className="auth-story">
        <Link to="/" className="auth-brand">
          <img src="/logo.svg" alt="" />
          OpenAgent
        </Link>
        <div>
          <span className="auth-eyebrow">OPENAGENT / WORKSPACE</span>
          <h1>{t('Your workspace, your language.')}</h1>
          <p>
            {t(
              'One workspace for your ideas, documents, and AI conversations.'
            )}
          </p>
        </div>
        <div className="auth-story-footer">
          OpenAgent · {new Date().getFullYear()}
        </div>
      </aside>
      <section className="auth-main">
        <div className="auth-top">
          <LanguageSelect />
        </div>
        <div className="auth-card">
          <img className="auth-mark" src="/logo.svg" alt="OpenAgent" />
          <h2>{t(signup ? 'Create account' : 'Welcome back')}</h2>
          <p className="auth-subtitle">
            {t(
              signup
                ? 'Start your next idea with OpenAgent.'
                : 'Sign in to continue your work.'
            )}
          </p>
          <div className="social-buttons">
            {(['Google', 'GitHub'] as const).map(provider => (
              <button
                key={provider}
                type="button"
                disabled={
                  !ready ||
                  !providers?.includes(provider.toLowerCase()) ||
                  !!busyProvider ||
                  auth.isLoading
                }
                onClick={() => void oauth(provider)}
                title={
                  !providers?.includes(provider.toLowerCase())
                    ? t('Not configured yet')
                    : undefined
                }
              >
                {provider === 'Google' ? (
                  <GoogleDuotoneIcon />
                ) : (
                  <GithubDuotoneIcon />
                )}
                <span>{t(`Continue with ${provider}`)}</span>
                {providers && !providers.includes(provider.toLowerCase()) && (
                  <small>{t('Not configured yet')}</small>
                )}
              </button>
            ))}
          </div>
          {providers && providers.length === 0 && (
            <p className="auth-provider-note">
              {t(
                'Provider setup is required by the administrator. Email registration is available.'
              )}
            </p>
          )}
          <div className="auth-divider">
            <span>{t('Or use your email')}</span>
          </div>
          <form onSubmit={event => void submit(event)}>
            <label htmlFor="auth-email">{t('Email address')}</label>
            <input
              id="auth-email"
              dir="ltr"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
            <label htmlFor="auth-password">{t('Password')}</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={signup ? 'new-password' : 'current-password'}
              minLength={signup ? 8 : undefined}
              placeholder={signup ? t('At least 8 characters') : t('Password')}
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
            {signup && (
              <>
                <label htmlFor="auth-confirm">{t('Confirm password')}</label>
                <input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={event => setConfirmation(event.target.value)}
                  required
                />
              </>
            )}
            {error && (
              <p className="auth-error" role="alert">
                {t(error)}
              </p>
            )}
            <button
              className="auth-submit"
              disabled={!ready || auth.isLoading || !!busyProvider}
              type="submit"
            >
              {t(
                auth.isLoading || busyProvider
                  ? 'Please wait...'
                  : signup
                    ? 'Create account'
                    : 'Sign in'
              )}
            </button>
          </form>
          <p className="auth-switch">
            {t(signup ? 'Already have an account?' : 'New to OpenAgent?')}{' '}
            <Link
              to={`${signup ? '/sign-in' : '/sign-up'}?redirect=${encodeURIComponent(destination)}`}
            >
              {t(signup ? 'Sign in' : 'Create account')}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
