import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GitCompareArrows, X, Trash2 } from 'lucide-react';
import { useStore, MAX_COMPARE_TOOLS } from '@/store/useStore';

export default function CompareBar() {
  const location = useLocation();
  const { compareIds, tools, removeFromCompare, clearCompare } = useStore();

  // 对比页自身不显示悬浮栏
  const visible = compareIds.length > 0 && location.pathname !== '/compare';

  const selectedTools = compareIds
    .map(id => tools.find(t => t.id === id))
    .filter(Boolean)
    .slice(0, MAX_COMPARE_TOOLS);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="glass rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary-400 font-semibold text-sm flex-shrink-0">
              <GitCompareArrows className="w-5 h-5" />
              <span className="hidden sm:inline">对比</span>
              <span className="px-1.5 py-0.5 rounded-md bg-primary-500/20 text-xs">
                {compareIds.length}/{MAX_COMPARE_TOOLS}
              </span>
            </div>

            <div className="flex items-center -space-x-2 flex-1 overflow-x-auto scrollbar-hide">
              {selectedTools.map(tool => tool && (
                <div
                  key={tool.id}
                  className="relative group flex-shrink-0"
                  title={tool.name}
                >
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-9 h-9 rounded-xl object-cover border-2 border-dark-800 bg-dark-900"
                  />
                  <button
                    onClick={() => removeFromCompare(tool.id)}
                    title={`移除 ${tool.name}`}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white items-center justify-center hidden group-hover:flex hover:bg-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {Array.from({ length: MAX_COMPARE_TOOLS - selectedTools.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-9 h-9 rounded-xl border-2 border-dashed border-gray-700 bg-dark-900/40 flex-shrink-0"
                />
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clearCompare}
                title="清空对比"
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Link
                to="/compare"
                className="btn-primary !px-4 !py-2 text-sm"
              >
                开始对比
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
