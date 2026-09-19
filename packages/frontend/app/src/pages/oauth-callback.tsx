import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { t } from '@/lib/i18n';
import { safeReturnPath } from './auth-page';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const code = params.get('code');
        const state = params.get('state');
        const nonce = sessionStorage.getItem('oauth-client-nonce');
        if (params.has('error') || !code || !state || !nonce) throw new Error();
        const parsed = JSON.parse(state);
        if (
          !['Google', 'GitHub'].includes(parsed.provider) ||
          typeof parsed.state !== 'string'
        )
          throw new Error();
        const response = await fetch('/api/oauth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state, client_nonce: nonce }),
        });
        if (!response.ok) throw new Error();
        const result = await response.json();
        await useAuthStore.getState().refreshSession();
        if (!useAuthStore.getState().user) throw new Error();
        navigate(safeReturnPath(result.redirectUri), { replace: true });
      } catch {
        navigate('/sign-in?error=oauth', { replace: true });
      } finally {
        sessionStorage.removeItem('oauth-client-nonce');
      }
    })();
  }, [params, navigate]);
  return (
    <main className="settings-page">
      <p role="status">{t('Completing sign-in...')}</p>
    </main>
  );
}
