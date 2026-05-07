import { motion } from 'framer-motion';
import Container from '../layout/Container';
import SkillBar from '../ui/SkillBar';
import { skills } from '../../data/portfolio';

const categories = [
  { value: 'frontend', label: '前端技术', skills: skills.filter(s => s.category === 'frontend') },
  { value: 'backend', label: '后端技术', skills: skills.filter(s => s.category === 'backend') },
  { value: 'tools', label: '工具链', skills: skills.filter(s => s.category === 'tools') }
] as const;

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-gray-50 dark:bg-gray-800">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            技术栈
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            我熟练掌握的各种技术工具和框架
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-12">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full" />
                {category.label}
              </h3>
              <div className="space-y-4">
                {category.skills.map((skill, index) => (
                  <SkillBar 
                    key={skill.name} 
                    skill={skill} 
                    index={categoryIndex * 4 + index} 
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
