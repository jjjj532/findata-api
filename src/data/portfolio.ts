export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
  tags: string[];
  image: string;
  demo?: string;
  github?: string;
  featured: boolean;
}

export interface Skill {
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'tools';
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

export const profile: Profile = {
  name: '张三',
  title: '全栈开发工程师',
  bio: '热爱技术，专注于构建优雅且高性能的 Web 应用。拥有 5 年前端和后端开发经验，擅长 React、Node.js 和云原生架构。',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  social: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    email: 'hello@example.com'
  }
};

export const projects: Project[] = [
  {
    id: '1',
    title: '电商平台管理系统',
    description: '基于 React 和 Node.js 构建的现代化电商后台管理系统，支持商品管理、订单处理、数据分析等功能。',
    category: 'fullstack',
    tags: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    demo: 'https://demo.example.com',
    github: 'https://github.com/example/ecommerce-admin',
    featured: true
  },
  {
    id: '2',
    title: '在线协作文档编辑器',
    description: '支持实时协作的文档编辑器，基于 CRDT 算法实现，支持多人同时编辑、评论和版本历史。',
    category: 'frontend',
    tags: ['React', 'TypeScript', 'WebSocket', 'Monaco Editor'],
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=400&fit=crop',
    demo: 'https://docs.example.com',
    github: 'https://github.com/example/collab-docs',
    featured: true
  },
  {
    id: '3',
    title: '移动端记账应用',
    description: '简洁易用的个人记账应用，支持支出分类、预算管理、报表分析，采用 React Native 开发。',
    category: 'mobile',
    tags: ['React Native', 'Redux', 'SQLite', 'Charts'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
    github: 'https://github.com/example/expense-tracker',
    featured: false
  },
  {
    id: '4',
    title: '微服务电商 API',
    description: '基于微服务架构的电商后端 API，包含用户服务、商品服务、订单服务和支付服务。',
    category: 'backend',
    tags: ['Go', 'gRPC', 'Docker', 'Kubernetes'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    github: 'https://github.com/example/microservices-api',
    featured: true
  },
  {
    id: '5',
    title: '数据可视化仪表板',
    description: '企业级数据分析和可视化平台，支持多数据源接入、自定义图表和实时数据监控。',
    category: 'frontend',
    tags: ['Vue.js', 'D3.js', 'Python', 'FastAPI'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    demo: 'https://dashboard.example.com',
    github: 'https://github.com/example/data-viz',
    featured: false
  },
  {
    id: '6',
    title: '社交媒体营销工具',
    description: '一站式社交媒体管理和分析工具，支持多平台发布、内容日历和效果分析。',
    category: 'fullstack',
    tags: ['Next.js', 'GraphQL', 'MongoDB', 'TailwindCSS'],
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    demo: 'https://social.example.com',
    github: 'https://github.com/example/social-tools',
    featured: true
  }
];

export const skills: Skill[] = [
  { name: 'React / Next.js', level: 95, category: 'frontend' },
  { name: 'TypeScript', level: 90, category: 'frontend' },
  { name: 'TailwindCSS', level: 92, category: 'frontend' },
  { name: 'Node.js', level: 88, category: 'backend' },
  { name: 'Python', level: 80, category: 'backend' },
  { name: 'PostgreSQL / MongoDB', level: 85, category: 'backend' },
  { name: 'Docker / Kubernetes', level: 75, category: 'tools' },
  { name: 'Git / CI/CD', level: 90, category: 'tools' }
];
