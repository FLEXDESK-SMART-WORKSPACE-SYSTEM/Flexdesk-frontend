(() => {
  const api = 'http://127.0.0.1:8002/api/v1';
  const tokenKey = 'flexdesk_token';
  const userKey = 'flexdesk_user';
  const path = window.location.pathname;
  const originalFetch = window.fetch.bind(window);
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);

  function clearSession() {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(userKey);
  }

  function redirectToLogin() {
    if (path === '/login.html') return;
    const next = `${path}${window.location.search}${window.location.hash}`;
    window.location.replace(`/login.html?next=${encodeURIComponent(next)}`);
  }

  const token = sessionStorage.getItem(tokenKey);
  if (!token) {
    redirectToLogin();
    return;
  }

  window.fetch = (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    const apiUrl = new URL(api);
    if (url.origin === apiUrl.origin && url.pathname.startsWith(apiUrl.pathname)) {
      const headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined));
      headers.set('Authorization', `Bearer ${token}`);
      options = { ...options, headers };
    }
    return originalFetch(input, options).then((response) => {
      if (response.status === 401) {
        clearSession();
        redirectToLogin();
      }
      return response;
    });
  };

  originalFetch(`${api}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
    .then(async (response) => {
      if (!response.ok) throw new Error('Your session has expired. Please sign in again.');
      const user = await response.json();
      sessionStorage.setItem(userKey, JSON.stringify(user));
      const header = document.querySelector('.topbar');
      if (header) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Logout';
        button.setAttribute('aria-label', 'Log out of FLEXDESK');
        button.style.cssText = 'margin-left:12px;padding:8px 13px;border:1px solid rgba(255,255,255,.45);border-radius:8px;color:#fff;background:transparent;font-weight:750';
        button.addEventListener('click', async () => {
          try {
            const logoutResponse = await window.fetch(`${api}/auth/logout`, { method: 'POST' });
            if (!logoutResponse.ok) throw new Error('The server could not record logout.');
          } catch (error) {
            window.alert(error.message);
          } finally {
            clearSession();
            window.location.replace('/login.html');
          }
        });
        header.append(button);
      }
    })
    .catch(() => {
      clearSession();
      redirectToLogin();
    });
})();
