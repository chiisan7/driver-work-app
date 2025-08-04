
import React, { useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { api } from './services/api';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

const USER_STORAGE_KEY = 'bus_driver_user';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("ローカルストレージからのユーザー読み込みに失敗しました。", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = useCallback(async (employeeCode: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const loggedInUser = await api.login(employeeCode, password);
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('不明なエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  if (isLoading && !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-gray-500">読み込み中...</div>
        </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} isLoading={isLoading} error={authError} />
      )}
    </>
  );
};

export default App;
