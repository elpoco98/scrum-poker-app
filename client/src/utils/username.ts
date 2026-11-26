// The user name lives in localStorage, so it survives a page reload.
// Only this file knows the storage key.
const STORAGE_KEY = 'username'

export function loadUsername(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

export function saveUsername(name: string) {
  localStorage.setItem(STORAGE_KEY, name)
}
