import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import type { Profile } from '../../data/portfolio';

interface SocialLinksProps {
  social: Profile['social'];
  size?: 'sm' | 'md' | 'lg';
}

export default function SocialLinks({ social, size = 'md' }: SocialLinksProps) {
  const icons = {
    github: Github,
    twitter: Twitter,
    linkedin: Linkedin,
    email: Mail
  };
  
  const labels = {
    github: 'GitHub',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    email: '邮箱'
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const linkSizes = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3'
  };

  return (
    <div className="flex items-center gap-3">
      {Object.entries(social).map(([key, url]) => {
        if (!url) return null;
        
        const Icon = icons[key as keyof typeof icons];
        const isEmail = key === 'email';
        const href = isEmail ? `mailto:${url}` : url;
        
        return (
          <a
            key={key}
            href={href}
            target={isEmail ? undefined : '_blank'}
            rel={isEmail ? undefined : 'noopener noreferrer'}
            className={`${linkSizes[size]} rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110`}
            title={labels[key as keyof typeof labels]}
          >
            <Icon className={sizes[size]} />
          </a>
        );
      })}
    </div>
  );
}
