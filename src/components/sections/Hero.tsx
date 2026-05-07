import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Container from '../layout/Container';

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
      
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 tracking-wider uppercase"
          >
            欢迎来到我的世界
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white"
          >
            全栈开发
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              工程师
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            热爱技术创新，专注于构建高性能、可扩展的 Web 应用。
            5 年+ 经验，精通 React、Node.js 及现代云原生技术栈。
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#projects"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              查看项目
            </a>
            <a
              href="#about"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              了解更多
            </a>
          </motion.div>
        </motion.div>
      </Container>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
