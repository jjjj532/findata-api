import { motion } from 'framer-motion';
import type { Skill } from '../../data/portfolio';

interface SkillBarProps {
  skill: Skill;
  index: number;
}

export default function SkillBar({ skill, index }: SkillBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {skill.name}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {skill.level}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ 
            duration: 1, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
        />
      </div>
    </div>
  );
}
