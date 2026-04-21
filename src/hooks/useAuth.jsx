// 認証状態とユーザープロフィールを管理するカスタムフック
import { useState, useEffect, createContext, useContext } from 'react';
import { observeAuthState } from '../firebase/auth';
import { getUserProfile, updateLastLoginAt } from '../firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = 初期化中
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        // アプリを開くたびに lastLoginAt を更新（セッション継続中も対応）
        await updateLastLoginAt(user.uid);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // プロフィール再読み込み（オンボーディング後などに使う）
  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
