import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '#home', label: '首页' },
    { href: '#projects', label: '项目' },
    { href: '#skills', label: '技能' },
    { href: '#about', label: '关于' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="text-xl font-bold text-gray-900 dark:text-white">
            Portfolio
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="切换主题"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="菜单"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={toggleTheme}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              切换主题
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
