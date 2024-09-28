import {  LocalStorageObjectData, LocalStorageObjectType } from './local-storage.types';

type StorageOptions = {
  api?: 'LocalStorage' | 'SessionStorage';
};

function getStorageAPI(api: StorageOptions['api']): Storage {
  return api === 'SessionStorage' ? sessionStorage : localStorage;
}

function getItem<T extends LocalStorageObjectType>(
  item: T,
  options?: StorageOptions,
): LocalStorageObjectData<T>['data'] | null {
  const api = getStorageAPI(options?.api || 'LocalStorage');
  const data = api.getItem(item.toString());
  return data ? JSON.parse(data) : null;
}

function setItem<T extends LocalStorageObjectType>(
  itemName: T,
  data: LocalStorageObjectData<T>['data'],
  options?: StorageOptions,
): void {
  if (data === null || data === undefined) {
    return;
  }

  const api = getStorageAPI(options?.api || 'LocalStorage');
  api.setItem(itemName, JSON.stringify(data));
}

function removeItem<T extends LocalStorageObjectType>(item: T, options?: StorageOptions): void {
  const api = getStorageAPI(options?.api || 'LocalStorage');
  api.removeItem(item);
}

function clear(options?: StorageOptions): void {
  const api = getStorageAPI(options?.api || 'LocalStorage');
  api.clear();
}

export const localStorageAPI = {
  getItem,
  setItem,
  removeItem,
  clear,
};