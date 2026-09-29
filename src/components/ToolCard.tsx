import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight, GitCompareArrows, Check } from 'lucide-react';
import type { Tool } from '@/types';
import { categories } from '@/mock/tools';
import { useStore, MAX_COMPARE_TOOLS } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const categoryInfo = categories.find(c => c.id === tool.category);
  const { compareIds, toggleCompare } = useStore();
  const isInCompare = compareIds.includes(tool.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="h-full relative"
    >
      <Link
        to={`/tool/${tool.id}`}
        className="card-hover block group h-full"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-dark-900 p-2 flex-shrink-0 overflow-hidden border border-gray-700/50">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="flex-1 min-w-0 pr-16">
            <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-primary-400 transition-colors">
              {tool.name}
            </h3>
            {categoryInfo && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo.color} text-white/90`}>
                {categoryInfo.name}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {tool.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-md bg-dark-900 text-gray-400 text-xs border border-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
              <span className="text-white font-medium">{tool.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{(tool.usersCount / 1000).toFixed(0)}K+</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-primary-400 font-medium text-sm group-hover:gap-2 transition-all">
            查看详情
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-xs">起价</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  ¥{Math.min(...tool.plans.map(p => p.price))}
                </span>
                <span className="text-gray-500 text-sm">/月</span>
              </div>
            </div>
            <div className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity',
              isInCompare
                ? 'bg-primary-500/20 text-primary-300 opacity-100'
                : 'bg-primary-500/10 text-primary-400 opacity-0 group-hover:opacity-100'
            )}>
              {isInCompare ? '对比中' : '立即订阅'}
            </div>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleCompare(tool.id)}
        aria-pressed={isInCompare}
        title={isInCompare ? '从对比中移除' : '加入对比'}
        className={cn(
          'absolute top-4 right-4 z-10 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium',
          'backdrop-blur-md border transition-all active:scale-95',
          isInCompare
            ? 'bg-primary-500/80 border-primary-400 text-white hover:bg-primary-600/80'
            : 'bg-dark-900/70 border-gray-600/60 text-gray-300 hover:border-primary-500 hover:text-primary-400 hover:bg-primary-500/10'
        )}
      >
        {isInCompare ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <GitCompareArrows className="w-3.5 h-3.5" />
        )}
        {isInCompare ? `已加入 ${compareIds.length}/${MAX_COMPARE_TOOLS}` : '加入对比'}
      </button>
    </motion.div>
  );
}
