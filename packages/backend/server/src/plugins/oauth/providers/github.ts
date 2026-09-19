import { Injectable } from '@nestjs/common';

import { InvalidOauthCallbackCode, URLHelper } from '../../../base';
import { OAuthProviderName } from '../config';
import { OAuthProvider, Tokens } from './def';

interface AuthTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  name: string;
}

@Injectable()
export class GithubOAuthProvider extends OAuthProvider {
  provider = OAuthProviderName.GitHub;

  constructor(private readonly url: URLHelper) {
    super();
  }

  getAuthUrl(state: string) {
    return `https://github.com/login/oauth/authorize?${this.url.stringify({
      client_id: this.config.clientId,
      redirect_uri: this.url.link('/oauth/callback'),
      scope: 'read:user user:email',
      ...this.config.args,
      state,
    })}`;
  }

  async getToken(code: string) {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        body: this.url.stringify({
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.url.link('/oauth/callback'),
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.ok) {
      const ghToken = (await response.json()) as AuthTokenResponse;
      if (!ghToken.access_token) throw new InvalidOauthCallbackCode({ status: response.status, body: 'GitHub did not return an access token' });

      return {
        accessToken: ghToken.access_token,
        scope: ghToken.scope,
      };
    } else {
      const body = await response.text();
      if (response.status < 500) {
        throw new InvalidOauthCallbackCode({ status: response.status, body });
      }
      throw new Error(
        `Server responded with non-success status ${response.status}, body: ${body}`
      );
    }
  }

  async getUser(tokens: Tokens) {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (response.ok) {
      const user = (await response.json()) as UserInfo;
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokens.accessToken}`, Accept: 'application/vnd.github+json' },
      });
      if (!emailsResponse.ok) throw new Error('Unable to verify GitHub email');
      const emails = await emailsResponse.json() as { email: string; primary: boolean; verified: boolean }[];
      const email = emails.find(item => item.primary && item.verified)?.email ?? emails.find(item => item.verified)?.email;
      if (!email) throw new Error('GitHub account must have a verified email address');

      return {
        id: String(user.id),
        avatarUrl: user.avatar_url,
        email,
      };
    } else {
      throw new Error(
        `Server responded with non-success code ${
          response.status
        } ${await response.text()}`
      );
    }
  }
}
