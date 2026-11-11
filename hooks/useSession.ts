'use client';
import { AUTH_SESSION_SWR_KEY } from './index';
import { UserResponse } from '@/interface/response';
import { useEffect, useSyncExternalStore } from 'react';
import useSWR, { mutate } from 'swr';

export type AuthState = {
  token: string;
  refreshToken: string;
  user: Partial<UserResponse> | null;
};

const AUTH_USER_NAME_KEY = 'authUserName';

export const AUTH_INITIAL_STATE: AuthState = {
  token: '',
  refreshToken: '',
  user: null,
};

function getStoredAuthState(): AuthState {
  if (typeof window === 'undefined') return AUTH_INITIAL_STATE;

  const token = localStorage.getItem('token');
  if (!token) return AUTH_INITIAL_STATE;

  const name = localStorage.getItem(AUTH_USER_NAME_KEY);

  return {
    token,
    refreshToken: localStorage.getItem('refreshToken') ?? '',
    user: name ? { name } : null,
  };
}

export function setAuthState(state: AuthState) {
  if (state.user?.name) {
    localStorage.setItem(AUTH_USER_NAME_KEY, state.user.name);
  } else {
    localStorage.removeItem(AUTH_USER_NAME_KEY);
  }

  mutate(AUTH_SESSION_SWR_KEY, state, {
    revalidate: false,
  });
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_USER_NAME_KEY);
  mutate(AUTH_SESSION_SWR_KEY, AUTH_INITIAL_STATE, {
    revalidate: false,
  });
}

export function restoreAuthState(): string | null {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem(AUTH_USER_NAME_KEY);

  if (!token) return null;

  setAuthState({
    token,
    refreshToken: localStorage.getItem('refreshToken') ?? '',
    user: name ? { name } : null,
  });

  return token;
}

export function useSession() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { data = AUTH_INITIAL_STATE } = useSWR<AuthState>(
    AUTH_SESSION_SWR_KEY,
    () => AUTH_INITIAL_STATE,
    {
      fallbackData: AUTH_INITIAL_STATE,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
    },
  );

  useEffect(() => {
    setAuthState(getStoredAuthState());
  }, []);

  const token = data?.token;

  return {
    token,
    refreshToken: data.refreshToken,
    user: data.user,
    isAuthenticated: !!data.token,
    isHydrated,
  };
}
