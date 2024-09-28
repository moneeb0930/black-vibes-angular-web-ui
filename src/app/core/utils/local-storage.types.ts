import { AppTheme } from '../types';

type LocalStorageObjectMap = {
  'App/session': {
    user: string;
    token: string;
  };
  'App/theme': AppTheme;
};

export type LocalStorageObjectType = 'App/session' | 'App/theme';

export type LocalStorageObjectData<T extends LocalStorageObjectType> = {
  type: T;
  data: LocalStorageObjectMap[T];
};