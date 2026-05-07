import SocialLinks from '../ui/SocialLinks';
import { profile } from '../../data/portfolio';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 {profile.name}. All rights reserved.
            </p>
          </div>
          
          <SocialLinks social={profile.social} size="md" />
        </div>
      </div>
    </footer>
  );
}
