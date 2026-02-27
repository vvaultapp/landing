import { useState, useCallback } from 'react';

declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      getLoginStatus: (callback: (response: FBStatusResponse) => void) => void;
      login: (
        callback: (response: FBStatusResponse) => void,
        options?: { scope: string; return_scopes?: boolean }
      ) => void;
      logout: (callback?: () => void) => void;
      api: (
        path: string,
        method: string,
        params: Record<string, string>,
        callback: (response: any) => void
      ) => void;
    };
    __fbInitialized?: boolean;
  }
}

interface FBAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
}

interface FBStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FBAuthResponse;
}

interface FacebookLoginResult {
  accessToken: string;
  userID: string;
  expiresIn: number;
}

const RAW_FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;
const HARD_CODED_FACEBOOK_APP_ID = "889344043479838";
const FB_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const FB_SDK_ID = "facebook-jssdk";
const FB_API_VERSION = "v24.0";

export function useFacebookLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initFacebookSdk = useCallback(() => {
    if (!window.FB) {
      throw new Error('Facebook SDK not loaded');
    }
    const envAppId = (RAW_FACEBOOK_APP_ID || '').trim();
    if (envAppId && envAppId !== HARD_CODED_FACEBOOK_APP_ID) {
      console.warn(
        `Ignoring VITE_FACEBOOK_APP_ID="${envAppId}" and using hard-coded app id for Instagram login.`
      );
    }
    const appId = HARD_CODED_FACEBOOK_APP_ID;
    if (!window.__fbInitialized) {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: FB_API_VERSION,
      });
      window.__fbInitialized = true;
      (window as any).__fbAppId = appId;
    }
  }, []);

  const ensureFacebookSdk = useCallback(async (): Promise<void> => {
    if (window.FB) {
      initFacebookSdk();
      return;
    }

    await new Promise<void>((resolve, reject) => {
      if (document.getElementById(FB_SDK_ID)) {
        // Script tag exists but SDK not ready yet
        const waitForSdk = setInterval(() => {
          if (window.FB) {
            clearInterval(waitForSdk);
            try {
              initFacebookSdk();
              resolve();
            } catch (err) {
              reject(err);
            }
          }
        }, 50);
        setTimeout(() => {
          clearInterval(waitForSdk);
          reject(new Error('Facebook SDK load timed out'));
        }, 8000);
        return;
      }

      const js = document.createElement("script");
      js.id = FB_SDK_ID;
      js.src = FB_SDK_URL;
      js.async = true;
      js.defer = true;
      js.onload = () => {
        try {
          initFacebookSdk();
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      js.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.body.appendChild(js);
    });
  }, [initFacebookSdk]);

  const checkLoginStatus = useCallback((): Promise<FBStatusResponse> => {
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve({ status: 'unknown' });
        return;
      }
      window.FB.getLoginStatus((response) => {
        resolve(response);
      });
    });
  }, []);

  const login = useCallback((): Promise<FacebookLoginResult> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      ensureFacebookSdk()
        .then(() => {
          // Request permissions for Instagram Business API
          const scopes = [
            'instagram_basic',
            'instagram_manage_messages',
            'pages_show_list',
            'pages_messaging',
            'pages_read_engagement',
          ].join(',');

          window.FB.login(
            (response) => {
              setIsLoading(false);

              if (response.status === 'connected' && response.authResponse) {
                resolve({
                  accessToken: response.authResponse.accessToken,
                  userID: response.authResponse.userID,
                  expiresIn: response.authResponse.expiresIn,
                });
              } else if (response.status === 'not_authorized') {
                const errorMsg = 'You need to authorize the app to continue';
                setError(errorMsg);
                reject(new Error(errorMsg));
              } else {
                const errorMsg = 'Facebook login was cancelled or failed';
                setError(errorMsg);
                reject(new Error(errorMsg));
              }
            },
            { scope: scopes, return_scopes: true }
          );
        })
        .catch((err) => {
          const errorMsg = err instanceof Error ? err.message : 'Facebook SDK failed to load';
          setError(errorMsg);
          setIsLoading(false);
          reject(new Error(errorMsg));
        });

    });
  }, [ensureFacebookSdk]);

  const logout = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve();
        return;
      }
      window.FB.logout(() => {
        resolve();
      });
    });
  }, []);

  const getInstagramAccount = useCallback(
    async (
      accessToken: string
    ): Promise<{ accountId: string; username: string; profilePictureUrl?: string; pageId?: string; pageName?: string } | null> => {
      return new Promise((resolve) => {
        if (!window.FB) {
          resolve(null);
          return;
        }

        // First get user's Facebook pages
        window.FB.api('/me/accounts', 'GET', { access_token: accessToken }, async (pagesResponse) => {
          if (!pagesResponse.data || pagesResponse.data.length === 0) {
            console.log('No Facebook pages found');
            resolve(null);
            return;
          }

          // Check each page for connected Instagram account
          for (const page of pagesResponse.data) {
            window.FB.api(
              `/${page.id}`,
              'GET',
              { fields: 'instagram_business_account', access_token: accessToken },
              (igResponse) => {
                if (igResponse.instagram_business_account) {
                  const igAccountId = igResponse.instagram_business_account.id;
                  
                  // Get Instagram account details
                  window.FB.api(
                    `/${igAccountId}`,
                    'GET',
                    { fields: 'username,name,profile_picture_url', access_token: accessToken },
                    (igDetails) => {
                      resolve({
                        accountId: igAccountId,
                        username: igDetails.username || 'Unknown',
                        profilePictureUrl: igDetails.profile_picture_url,
                        pageId: page.id,
                        pageName: page.name,
                      });
                    }
                  );
                  return;
                }
              }
            );
          }

          // If we get here, no Instagram account was found
          setTimeout(() => resolve(null), 1000);
        });
      });
    },
    []
  );

  return {
    login,
    logout,
    checkLoginStatus,
    getInstagramAccount,
    isLoading,
    error,
  };
}
