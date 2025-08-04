import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (employeeCode: string, password: string) => void;
  isLoading: boolean;
  error: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading, error }) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(employeeCode, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl px-8 pt-10 pb-8 mb-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">シフト管理</h1>
            <p className="text-gray-500 mt-2">乗務員ログイン</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employee_code">
                社員コード
              </label>
              <input
                id="employee_code"
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="例: 12345"
                className="bg-white shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:bg-blue-300"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              パスワードを忘れた場合は、管理者に連絡してください。
            </p>
          </div>
        </div>
        <p className="text-center text-gray-500 text-xs">
          &copy;{new Date().getFullYear()} Bus Company. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;