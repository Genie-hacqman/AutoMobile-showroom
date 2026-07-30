const OWNER_KEY = 'obolo-owner';
const OWNER_PASSWORD = 'obolo-secret';

export function isOwner() {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(OWNER_KEY) === 'true';
}

export function signIn(password) {
if (password === OWNER_PASSWORD) {
    if (typeof window !== 'undefined') {
    window.localStorage.setItem(OWNER_KEY, 'true');
    }
    return true;
    }
  return false;
}

export function signOut() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(OWNER_KEY);
  }
}

export default { isOwner, signIn, signOut };
