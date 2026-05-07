import { TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Stocks', href: '/stocks' },
    { label: 'Futures', href: '/futures' },
    { label: 'Indices', href: '/indices' },
    { label: 'API Docs', href: '/docs' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FinData API</h1>
              <p className="text-xs text-gray-400">Enterprise Market Data</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Get API Key
            </button>
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <button className="py-2 text-sm text-gray-300 hover:text-white transition-colors text-left">
                  Sign In
                </button>
                <button className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Get API Key
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}