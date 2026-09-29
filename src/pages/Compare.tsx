import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Users,
  DollarSign,
  Tag,
  Check,
  Minus,
  X,
  Trash2,
  GitCompareArrows,
  LayoutGrid,
  Crown,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore, MAX_COMPARE_TOOLS } from '@/store/useStore';
import { categories } from '@/mock/tools';
import type { Tool } from '@/types';
import { cn } from '@/lib/utils';

function formatUsers(count: number) {
  if (count >= 10000) {
    const wan = count / 10000;
    return `${Number.isInteger(wan) ? wan : wan.toFixed(1)}万`;
  }
  return `${count}`;
}

function getStartPrice(tool: Tool) {
  return Math.min(...tool.plans.map(p => p.price));
}

interface ScalarRow {
  label: string;
  icon: typeof Star;
  renderCell: (tool: Tool) => ReactNode;
  /** 该行最优值（数值越小或越大）对应列索引，无最优则为 null */
  bestIndex: number | null;
  /** 是否为所有工具相同 */
  allSame: boolean;
}

interface FeatureRows {
  /** 功能/标签并集，按首次出现排序 */
  items: string[];
  /** items[i][j]：第 j 个工具是否包含第 i 项 */
  presence: boolean[][];
  /** 每个并集项是否所有工具都包含 */
  allPresent: boolean[];
}

function Toggle({
  checked,
  onChange,
  icon: Icon,
  label
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: typeof EyeOff;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all',
        checked
          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
          : 'bg-dark-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      <span
        className={cn(
          'relative w-9 h-5 rounded-full transition-colors flex-shrink-0',
          checked ? 'bg-primary-500' : 'bg-gray-600'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </span>
    </button>
  );
}

export default function Compare() {
  const navigate = useNavigate();
  const { tools, compareIds, removeFromCompare, clearCompare } = useStore();
  const [hideSame, setHideSame] = useState(false);
  const [highlightDiff, setHighlightDiff] = useState(true);

  // 按 compareIds 的加入顺序解析工具，过滤已失效的 id
  const selectedTools = useMemo(
    () => compareIds
      .map(id => tools.find(t => t.id === id))
      .filter((t): t is Tool => Boolean(t)),
    [compareIds, tools]
  );

  const count = selectedTools.length;
  const canCompare = count >= 2;

  // 空态：可回到市场
  if (count === 0) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24">
        <div className="container mx-auto px-4 py-12">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-24"
          >
            <div className="w-24 h-24 mb-8 rounded-full bg-dark-800 flex items-center justify-center border border-gray-700/50">
              <GitCompareArrows className="w-12 h-12 text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">对比列表为空</h1>
            <p className="text-gray-400 mb-8 max-w-md">
              还没有加入任何工具。去工具市场挑选最多 {MAX_COMPARE_TOOLS} 个工具，一起对比价格、评分、功能和标签吧。
            </p>
            <Link to="/market" className="btn-primary">
              <LayoutGrid className="w-4 h-4" />
              前往工具市场
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const startPrices = selectedTools.map(getStartPrice);
  const minPrice = Math.min(...startPrices);
  const maxRating = Math.max(...selectedTools.map(t => t.rating));
  const maxUsers = Math.max(...selectedTools.map(t => t.usersCount));

  const isAllSameStrings = (vals: (string | number)[]) => vals.every(v => v === vals[0]);

  // 标量行
  const scalarRows: ScalarRow[] = [
    {
      label: '起价（月付）',
      icon: DollarSign,
      allSame: isAllSameStrings(startPrices),
      bestIndex: startPrices.indexOf(minPrice),
      renderCell: (tool) => {
        const price = getStartPrice(tool);
        return price === 0 ? (
          <span className="text-green-400 font-semibold">免费</span>
        ) : (
          <span className="font-semibold text-white">
            ¥{price}<span className="text-gray-500 text-xs font-normal">/月</span>
          </span>
        );
      },
    },
    {
      label: '评分',
      icon: Star,
      allSame: isAllSameStrings(selectedTools.map(t => t.rating)),
      bestIndex: selectedTools.findIndex(t => t.rating === maxRating),
      renderCell: (tool) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-white">
          <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
          {tool.rating}
        </span>
      ),
    },
    {
      label: '用户数',
      icon: Users,
      allSame: isAllSameStrings(selectedTools.map(t => t.usersCount)),
      bestIndex: selectedTools.findIndex(t => t.usersCount === maxUsers),
      renderCell: (tool) => (
        <span className="font-semibold text-white">{formatUsers(tool.usersCount)}</span>
      ),
    },
    {
      label: '分类',
      icon: LayoutGrid,
      allSame: isAllSameStrings(selectedTools.map(t => t.category)),
      bestIndex: null,
      renderCell: (tool) => {
        const info = categories.find(c => c.id === tool.category);
        return info ? (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${info.color} text-white/90`}>
            {info.name}
          </span>
        ) : (
          <Minus className="w-4 h-4 text-gray-600" />
        );
      },
    },
    {
      label: '标签',
      icon: Tag,
      allSame: isAllSameStrings(selectedTools.map(t => t.tags.join('|'))),
      bestIndex: null,
      renderCell: (tool) =>
        tool.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {tool.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-dark-900 text-gray-300 text-xs border border-gray-700">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <Minus className="w-4 h-4 text-gray-600" />
        ),
    },
  ];

  // 构建功能/标签的并集矩阵
  const buildFeatureRows = (key: 'features' | 'tags'): FeatureRows => {
    const items: string[] = [];
    selectedTools.forEach(tool => {
      tool[key].forEach(item => {
        if (!items.includes(item)) items.push(item);
      });
    });
    const presence = items.map(item => selectedTools.map(tool => tool[key].includes(item)));
    const allPresent = presence.map(row => row.every(Boolean));
    return { items, presence, allPresent };
  };

  const featuresData = buildFeatureRows('features');
  const tagsData = buildFeatureRows('tags');

  // 隐藏相同项：仅在 >=2 个工具时生效（单个工具时所有值都“与自己相同”）
  const effectiveHideSame = hideSame && canCompare;
  const visibleScalarRows = effectiveHideSame ? scalarRows.filter(row => !row.allSame) : scalarRows;
  const visibleFeatureItems = effectiveHideSame
    ? featuresData.items.map((item, i) => ({ item, present: featuresData.presence[i] })).filter((_, i) => !featuresData.allPresent[i])
    : featuresData.items.map((item, i) => ({ item, present: featuresData.presence[i] }));
  const visibleTagItems = effectiveHideSame
    ? tagsData.items.map((item, i) => ({ item, present: tagsData.presence[i] })).filter((_, i) => !tagsData.allPresent[i])
    : tagsData.items.map((item, i) => ({ item, present: tagsData.presence[i] }));

  const hasAnyDifference = !scalarRows.every(r => r.allSame) ||
    !featuresData.allPresent.every(Boolean) ||
    !tagsData.allPresent.every(Boolean);

  const handleClear = () => {
    clearCompare();
  };

  // 网格列：首列标签 + 每个工具一列
  const gridStyle = {
    gridTemplateColumns: `minmax(110px, 160px) repeat(${count}, minmax(180px, 1fr))`,
  };

  const cellBase = 'px-4 py-4 border-t border-gray-800/80 flex items-center justify-center text-center text-sm';

  return (
    <div className="min-h-screen bg-dark-950 pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              工具<span className="gradient-text">对比</span>
            </h1>
            <p className="text-lg text-gray-400 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-sm font-medium">
                <GitCompareArrows className="w-4 h-4" />
                {count}/{MAX_COMPARE_TOOLS}
              </span>
              {count < MAX_COMPARE_TOOLS && (
                <Link
                  to="/market"
                  className="text-sm text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
                >
                  继续添加工具
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Toggle
              checked={hideSame}
              onChange={setHideSame}
              icon={EyeOff}
              label="隐藏相同项"
            />
            <Toggle
              checked={highlightDiff}
              onChange={setHighlightDiff}
              icon={Sparkles}
              label="突出差异"
            />
            <button
              onClick={handleClear}
              disabled={count === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border bg-dark-900 border-gray-700 text-gray-400 hover:border-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>
        </motion.div>

        {!canCompare && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6 border-secondary-500/30 bg-secondary-500/5"
          >
            <p className="text-sm text-secondary-300 flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              至少选择 2 个工具才能进行有效对比，
              <Link to="/market" className="text-white underline underline-offset-2 hover:text-primary-300">
                再去添加一个
              </Link>
            </p>
          </motion.div>
        )}

        {canCompare && hideSame && !hasAnyDifference && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <p className="text-sm text-gray-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              已隐藏所有相同项：这些工具当前对比维度完全一致，关闭「隐藏相同项」可查看全部信息。
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card !p-0 overflow-x-auto"
        >
          <div className="min-w-[640px]">
            <div className="grid" style={gridStyle}>
              {/* 表头：工具列 */}
              <div className="px-4 py-5 bg-dark-900/60 border-b border-gray-800 flex items-center">
                <span className="text-sm font-medium text-gray-400">对比项</span>
              </div>
              {selectedTools.map((tool) => {
                const info = categories.find(c => c.id === tool.category);
                return (
                  <div key={tool.id} className="px-4 py-5 bg-dark-900/60 border-b border-l border-gray-800 relative group">
                    <button
                      onClick={() => removeFromCompare(tool.id)}
                      title="从对比中移除"
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <Link to={`/tool/${tool.id}`} className="flex flex-col items-center text-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-dark-800 p-2 overflow-hidden border border-gray-700/50 group-hover:border-primary-500/50 transition-colors">
                        <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <span className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {tool.name}
                      </span>
                      {info && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r ${info.color} text-white/90`}>
                          {info.name}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}

              {/* 基础信息分区标题 */}
              <div
                className="px-4 py-2.5 col-span-full bg-dark-900/40 border-t border-gray-800 text-xs font-semibold tracking-wide text-gray-500 uppercase"
                style={{ gridColumn: `1 / -1` }}
              >
                基础信息
              </div>

              {/* 标量行 */}
              {visibleScalarRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="contents">
                    <div className={cn(cellBase, 'justify-start gap-2 text-gray-400 font-medium bg-dark-900/30')}>
                      <Icon className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      {row.label}
                    </div>
                    {selectedTools.map((tool, j) => {
                      const isBest = canCompare && row.bestIndex === j && !row.allSame;
                      const isDiff = canCompare && highlightDiff && !row.allSame;
                      return (
                        <div
                          key={tool.id}
                          className={cn(
                            cellBase, 'border-l',
                            isDiff && 'bg-primary-500/[0.07]',
                            !isDiff && 'bg-transparent'
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {row.renderCell(tool)}
                            {isBest && (
                              <span
                                title="该项最优"
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gold-500/15 text-gold-400 text-[10px] font-semibold border border-gold-500/30"
                              >
                                <Crown className="w-3 h-3" />
                                最优
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* 功能分区标题 */}
              <div
                className="px-4 py-2.5 bg-dark-900/40 border-t border-gray-800 text-xs font-semibold tracking-wide text-gray-500 uppercase"
                style={{ gridColumn: `1 / -1` }}
              >
                功能特性
              </div>

              {visibleFeatureItems.length === 0 && (
                <div
                  className="px-4 py-6 col-span-full border-t border-gray-800 text-center text-sm text-gray-500"
                  style={{ gridColumn: `1 / -1` }}
                >
                  {effectiveHideSame ? '所有功能均相同，已隐藏' : '暂无功能数据'}
                </div>
              )}
              {visibleFeatureItems.map(({ item, present }) => {
                const isDiff = canCompare && highlightDiff && present.some(v => !v);
                return (
                  <div key={`feature-${item}`} className="contents">
                    <div className={cn(cellBase, 'justify-start text-gray-400 bg-dark-900/30')}>
                      {item}
                    </div>
                    {selectedTools.map((tool, j) => (
                      <div
                        key={tool.id}
                        className={cn(
                          cellBase, 'border-l',
                          isDiff && present[j] && 'bg-green-500/[0.08]',
                          isDiff && !present[j] && 'bg-red-500/[0.05]'
                        )}
                      >
                        {present[j] ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/15 border border-green-500/30">
                            <Check className="w-4 h-4 text-green-400" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-dark-900 border border-gray-700">
                            <Minus className="w-4 h-4 text-gray-600" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* 标签分区标题 */}
              <div
                className="px-4 py-2.5 bg-dark-900/40 border-t border-gray-800 text-xs font-semibold tracking-wide text-gray-500 uppercase"
                style={{ gridColumn: `1 / -1` }}
              >
                标签
              </div>

              {visibleTagItems.length === 0 && (
                <div
                  className="px-4 py-6 col-span-full border-t border-gray-800 text-center text-sm text-gray-500"
                  style={{ gridColumn: `1 / -1` }}
                >
                  {effectiveHideSame ? '所有标签均相同，已隐藏' : '暂无标签数据'}
                </div>
              )}
              {visibleTagItems.map(({ item, present }) => {
                const isDiff = canCompare && highlightDiff && present.some(v => !v);
                return (
                  <div key={`tag-${item}`} className="contents">
                    <div className={cn(cellBase, 'justify-start text-gray-400 bg-dark-900/30')}>
                      <span className="px-2 py-0.5 rounded-md bg-dark-900 text-gray-300 text-xs border border-gray-700">
                        {item}
                      </span>
                    </div>
                    {selectedTools.map((tool, j) => (
                      <div
                        key={tool.id}
                        className={cn(
                          cellBase, 'border-l',
                          isDiff && present[j] && 'bg-primary-500/[0.07]'
                        )}
                      >
                        {present[j] ? (
                          <Check className="w-4 h-4 text-primary-400" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* 操作行 */}
              <div
                className="px-4 py-2.5 bg-dark-900/40 border-t border-gray-800 text-xs font-semibold tracking-wide text-gray-500 uppercase"
                style={{ gridColumn: `1 / -1` }}
              >
                操作
              </div>
              <div className={cn(cellBase, 'justify-start text-gray-400 font-medium bg-dark-900/30')}>
                订阅 / 详情
              </div>
              {selectedTools.map(tool => (
                <div key={tool.id} className={cn(cellBase, 'border-l')}>
                  <Link
                    to={`/tool/${tool.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium border border-primary-500/30 hover:bg-primary-500/20 transition-all"
                  >
                    查看详情
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
