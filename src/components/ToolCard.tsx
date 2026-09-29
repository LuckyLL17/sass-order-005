import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight, Plus, Check } from 'lucide-react';
import type { Tool } from '@/types';
import { categories } from '@/mock/tools';
import { useStore, MAX_COMPARE_TOOLS } from '@/store/useStore';

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const categoryInfo = categories.find(c => c.id === tool.category);
  const isInCompare = useStore((state) => state.compareToolIds.includes(tool.id));
  const addToCompare = useStore((state) => state.addToCompare);
  const showToast = useStore((state) => state.showToast);
  const compareCount = useStore((state) => state.compareToolIds.length);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCompare) {
      showToast(`${tool.name} 已在对比列表中`, 'info');
      return;
    }

    const result = addToCompare(tool.id);
    if (result.ok) {
      showToast(`已将 ${tool.name} 加入对比（${compareCount + 1}/${MAX_COMPARE_TOOLS}）`, 'success');
    } else if (result.reason === 'duplicate') {
      showToast(`${tool.name} 已在对比列表中，无需重复添加`, 'info');
    } else {
      showToast(`最多只能对比 ${MAX_COMPARE_TOOLS} 个工具，请先移除部分工具`, 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/tool/${tool.id}`}
        className="card-hover block group h-full relative"
      >
        <button
          onClick={handleToggleCompare}
          title={isInCompare ? '已加入对比' : '加入对比'}
          aria-label={isInCompare ? '已加入对比' : '加入对比'}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 ${
            isInCompare
              ? 'bg-primary-500/20 border-primary-500/50 text-primary-400 opacity-100'
              : 'bg-dark-900/80 border-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-400'
          }`}
        >
          {isInCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-dark-900 p-2 flex-shrink-0 overflow-hidden border border-gray-700/50">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="flex-1 min-w-0">
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
            <div className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              立即订阅
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
