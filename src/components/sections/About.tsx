import { motion } from 'framer-motion';
import Container from '../layout/Container';
import SocialLinks from '../ui/SocialLinks';
import { profile } from '../../data/portfolio';

export default function About() {
  return (
    <section id="about" className="py-24 bg-white dark:bg-gray-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            关于我
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {profile.title}
                </p>
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {profile.bio}
              </p>

              <div className="pt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  联系我
                </p>
                <SocialLinks social={profile.social} size="lg" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
