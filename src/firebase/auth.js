// Firebase Authentication に関する処理をまとめたファイル
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config';

// 新規登録
export const signUpWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// ログイン
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// ログアウト
export const logout = () => signOut(auth);

// 認証状態の監視（callback に user または null が渡る）
export const observeAuthState = (callback) =>
  onAuthStateChanged(auth, callback);
