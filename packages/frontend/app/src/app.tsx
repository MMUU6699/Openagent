import './index.css';
import '@afk/component/theme';
import './auth-theme.css';

import { ConfirmModalProvider } from '@afk/component';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { AuthGuard } from './components/auth-guard';
import { ChatPage } from './pages/chats/chat';
import { ChatPlaybackPage } from './pages/chats/chat-playback';
import { ChatsDashboard } from './pages/chats/chats-dashboard';
import { DocEditTest } from './pages/doc-edit-test';
import { DocPage } from './pages/doc-page';
import { HomePage } from './pages/home';
import { OALayout } from './pages/layout/chat-layout';
import { LibraryDashboard } from './pages/library-dashboard';
import { MagicLinkPage } from './pages/magic-link';
import { OAuthCallbackPage } from './pages/oauth-callback';
import { oauthLoginLoader, OAuthLoginPage } from './pages/oauth-login';
import { redirectProxyLoader, RedirectProxyPage } from './pages/redirect';
import { SignInPage } from './pages/auth-page';
import { SettingsPage } from './pages/settings';
import { useLanguage } from './lib/i18n';
import { useSidebarStore } from './store/sidebar';

const ChatsPage = () => {
  return (
    <Routes>
      <Route element={<OALayout />}>
        <Route index element={<ChatsDashboard />} />
        <Route path=":id" element={<ChatPage />} />
      </Route>

      <Route path=":id/playback" element={<ChatPlaybackPage />} />
    </Routes>
  );
};

const LibraryPage = () => {
  return (
    <Routes>
      <Route element={<OALayout />}>
        <Route path="/" element={<LibraryDashboard />} />
        <Route path="/:id" element={<DocPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  const { open } = useSidebarStore();

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', open);
  }, [open]);

  return (
    <ConfirmModalProvider>
      <Routes key={language}>
        <Route path="/sign-in" element={<SignInPage key="sign-in" />} />
        <Route
          path="/sign-up"
          element={<SignInPage key="sign-up" initialStep="register" />}
        />
        <Route path="/magic-link" element={<MagicLinkPage />} />
        <Route
          path="/chats/*"
          element={
            <AuthGuard>
              <ChatsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/library/*"
          element={
            <AuthGuard>
              <LibraryPage />
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          }
        />
        <Route path="/doc-edit-test" element={<DocEditTest />} />
        <Route
          path="/onboarding"
          element={<Navigate to="/sign-up" replace />}
        />
        <Route
          path="/"
          element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          }
        />
        <Route
          path="/redirect-proxy"
          element={<RedirectProxyPage />}
          loader={redirectProxyLoader}
        />
        <Route
          path="/oauth/login"
          element={<OAuthLoginPage />}
          loader={oauthLoginLoader}
        />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      </Routes>
    </ConfirmModalProvider>
  );
}

export default App;
