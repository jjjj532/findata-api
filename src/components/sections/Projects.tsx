import { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '../layout/Container';
import ProjectCard from '../ui/ProjectCard';
import { projects } from '../../data/portfolio';

type Category = 'all' | 'frontend' | 'backend' | 'fullstack' | 'mobile';

export default function Projects() {
  const [filter, setFilter] = useState<Category>('all');
  
  const categories = [
    { value: 'all', label: '全部' },
    { value: 'frontend', label: '前端' },
    { value: 'backend', label: '后端' },
    { value: 'fullstack', label: '全栈' },
    { value: 'mobile', label: '移动端' }
  ] as const;

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="projects" className="py-24 bg-white dark:bg-gray-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            精选项目
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            展示我近期的开发作品，涵盖前端、后端和移动端应用
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === cat.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
