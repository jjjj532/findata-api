import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';
import type { Project } from '../../data/portfolio';
import Badge from './Badge';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-900 hover:bg-white transition-colors"
            >
              <Github className="w-4 h-4" />
              源码
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm rounded-lg text-sm font-medium text-white hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              预览
            </a>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map(tag => (
            <Badge key={tag} size="sm">{tag}</Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="secondary" size="sm">+{project.tags.length - 3}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
