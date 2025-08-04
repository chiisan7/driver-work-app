
import React from 'react';
import { User } from '../types';
import { LogoutIcon } from './icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-gray-800">
            バス乗務員シフト
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              ようこそ、<span className="font-semibold">{user.name}</span> さん
            </span>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600 transition-colors duration-200"
              aria-label="ログアウト"
            >
              <LogoutIcon className="w-5 h-5" />
              <span className="hidden md:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
