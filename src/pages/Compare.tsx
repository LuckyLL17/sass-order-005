import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitCompareArrows,
  Star,
  Users,
  Check,
  Minus,
  X,
  Trash2,
  ArrowLeft,
  Plus,
  Trophy,
  Tag,
  LayoutGrid,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore, MAX_COMPARE_TOOLS } from '@/store/useStore';
import { categories } from '@/mock/tools';
import type { Tool } from '@/types';
import { cn } from '@/lib/utils';

type RowType = 'price' | 'rating' | 'users' | 'feature' | 'tag';

interface CompareRow {
  key: string;
  type: RowType;
  label: string;
  values: Array<string | number | boolean>;
  allSame: boolean;
  bestIndex?: number;
}

function Toggle({
  checked,
  onChange,
  icon,
  label
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all',
        checked
          ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
          : 'bg-dark-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
      )}
    >
      {icon}
      {label}
      <span className={cn(
        'ml-1 relative h-[18px] w-8 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-primary-500' : 'bg-gray-700'
      )}>
        <span className={cn(
          'absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform',
          checked && 'translate-x-[14px]'
        )} />
      </span>
    </button>
  );
}

const formatUsers = (count: number) => `${(count / 1000).toFixed(0)}K+`;

export default function Compare() {
  const navigate = useNavigate();
  const tools = useStore((state) => state.tools);
  const compareToolIds = useStore((state) => state.compareToolIds);
  const removeFromCompare = useStore((state) => state.removeFromCompare);
  const clearCompare = useStore((state) => state.clearCompare);
  const showToast = useStore((state) => state.showToast);

  const [hideSame, setHideSame] = useState(false);
  const [highlightDiff, setHighlightDiff] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  const compareTools = useMemo(
    () =>
      compareToolIds
        .map((id) => tools.find((t) => t.id === id))
        .filter((t): t is Tool => !!t),
    [compareToolIds, tools]
  );

  const rows = useMemo<CompareRow[]>(() => {
    if (compareTools.length === 0) return [];

    const minPrice = (t: Tool) => Math.min(...t.plans.map((p) => p.price));

    const indexOfMin = (nums: number[]) => nums.indexOf(Math.min(...nums));
    const indexOfMax = (nums: number[]) => nums.indexOf(Math.max(...nums));

    const priceValues = compareTools.map(minPrice);
    const ratingValues = compareTools.map((t) => t.rating);
    const usersValues = compareTools.map((t) => t.usersCount);

    const toRow = (
      key: string,
      type: RowType,
      label: string,
      values: Array<string | number | boolean>,
      bestIndex?: number
    ): CompareRow => ({
      key,
      type,
      label,
      values,
      allSame: new Set(values.map(String)).size === 1,
      bestIndex
    });

    const result: CompareRow[] = [
      toRow('price', 'price', '起步价', priceValues, indexOfMin(priceValues)),
      toRow('rating', 'rating', '评分', ratingValues, indexOfMax(ratingValues)),
      toRow('users', 'users', '用户数', usersValues, indexOfMax(usersValues))
    ];

    const featureUnion = Array.from(new Set(compareTools.flatMap((t) => t.features)));
    featureUnion.forEach((feature) => {
      result.push(
        toRow(
          `feature-${feature}`,
          'feature',
          feature,
          compareTools.map((t) => t.features.includes(feature))
        )
      );
    });

    const tagUnion = Array.from(new Set(compareTools.flatMap((t) => t.tags)));
    tagUnion.forEach((tag) => {
      result.push(
        toRow(
          `tag-${tag}`,
          'tag',
          tag,
          compareTools.map((t) => t.tags.includes(tag))
        )
      );
    });

    return result;
  }, [compareTools]);

  const visibleRows = useMemo(() => {
    if (!hideSame) return rows;
    return rows.filter((row) => !row.allSame);
  }, [rows, hideSame]);

  const featureRows = visibleRows.filter((r) => r.type === 'feature');
  const tagRows = visibleRows.filter((r) => r.type === 'tag');
  const baseRows = visibleRows.filter((r) => r.type === 'price' || r.type === 'rating' || r.type === 'users');

  const handleRemove = (tool: Tool) => {
    removeFromCompare(tool.id);
    showToast(`已将 ${tool.name} 移出对比`, 'info');
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearCompare();
    setConfirmClear(false);
    showToast('已清空对比列表', 'info');
  };

  const isMinority = (row: CompareRow, cellIndex: number) => {
    const trueCount = row.values.filter(Boolean).length;
    const falseCount = row.values.length - trueCount;
    if (trueCount === falseCount) return row.values[cellIndex] === true;
    const minorityValue = trueCount < falseCount;
    return row.values[cellIndex] === minorityValue;
  };

  const renderCell = (row: CompareRow, tool: Tool, cellIndex: number) => {
    const value = row.values[cellIndex];
    const differs = !row.allSame && highlightDiff;

    if (row.type === 'price') {
      const price = value as number;
      const isBest = differs && cellIndex === row.bestIndex;
      return (
        <div className={cn(
          'flex flex-col items-center justify-center gap-1',
          isBest && 'text-white'
        )}>
          <span className="text-lg font-bold">
            {price === 0 ? '免费' : `¥${price}`}
          </span>
          {price > 0 && <span className="text-xs text-gray-500">/月</span>}
          {isBest && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-primary-500/20 text-primary-300 border border-primary-500/40">
              <Trophy className="w-3 h-3" />
              最低
            </span>
          )}
        </div>
      );
    }

    if (row.type === 'rating') {
      const isBest = differs && cellIndex === row.bestIndex;
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
            <span className={cn('text-lg font-bold', isBest && 'text-white')}>{value}</span>
          </div>
          {isBest && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-primary-500/20 text-primary-300 border border-primary-500/40">
              <Trophy className="w-3 h-3" />
              最高
            </span>
          )}
        </div>
      );
    }

    if (row.type === 'users') {
      const isBest = differs && cellIndex === row.bestIndex;
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className={cn('text-lg font-bold', isBest && 'text-white')}>
              {formatUsers(value as number)}
            </span>
          </div>
          {isBest && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-primary-500/20 text-primary-300 border border-primary-500/40">
              <Trophy className="w-3 h-3" />
              最多
            </span>
          )}
        </div>
      );
    }

    // feature / tag: boolean presence
    const has = value === true;
    const highlight = differs && isMinority(row, cellIndex);

    if (row.type === 'tag') {
      return has ? (
        <div className="flex items-center justify-center">
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-md text-xs border',
            highlight
              ? 'bg-primary-500/20 text-primary-300 border-primary-500/50'
              : 'bg-dark-900 text-gray-300 border-gray-700'
          )}>
            <Tag className="w-3 h-3 mr-1" />
            {row.label}
          </span>
        </div>
      ) : (
        <Minus className="w-4 h-4 text-gray-600 mx-auto" />
      );
    }

    return has ? (
      <div className="flex items-center justify-center">
        <span className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center',
          highlight ? 'bg-primary-500/20 text-primary-400' : 'bg-green-500/10 text-green-400'
        )}>
          <Check className="w-4 h-4" />
        </span>
      </div>
    ) : (
      <Minus className="w-4 h-4 text-gray-600 mx-auto" />
    );
  };

  const renderRowGroup = (groupRows: CompareRow[], sectionIcon: React.ReactNode, sectionTitle: string) => {
    if (groupRows.length === 0) return null;
    return (
      <>
        <div
          className="col-span-full flex items-center gap-2 px-4 py-2.5 bg-dark-900/80 border-y border-gray-800 text-sm font-semibold text-gray-300"
        >
          {sectionIcon}
          {sectionTitle}
        </div>
        {groupRows.map((row) => (
          <div key={row.key} className="contents">
            <div className={cn(
              'sticky left-0 z-10 bg-dark-800/95 backdrop-blur-sm px-4 py-3.5 flex items-center gap-2 border-b border-gray-800/60 text-sm',
              !row.allSame && highlightDiff ? 'text-white font-medium' : 'text-gray-400'
            )}>
              {!row.allSame && highlightDiff && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
              )}
              <span className="truncate">{row.label}</span>
            </div>
            {compareTools.map((tool, i) => (
              <div
                key={tool.id}
                className={cn(
                  'px-4 py-3.5 text-center border-b border-l border-gray-800/60 text-sm',
                  !row.allSame && highlightDiff && row.type !== 'feature' && row.type !== 'tag'
                    ? i === row.bestIndex
                      ? 'bg-primary-500/10'
                      : ''
                    : ''
                )}
              >
                {renderCell(row, tool, i)}
              </div>
            ))}
          </div>
        ))}
      </>
    );
  };

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
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            工具<span className="gradient-text">对比</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            并排对比价格、评分、用户数、功能与标签，快速找到最合适的工具
          </p>
        </motion.div>

        {compareTools.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card flex flex-col items-center text-center py-20 px-6"
          >
            <div className="w-20 h-20 mb-6 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
              <GitCompareArrows className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">还没有可对比的工具</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              在工具市场点击卡片右上角的 + ，或在工具详情页点击「加入对比」，最多可选择 {MAX_COMPARE_TOOLS} 个工具
            </p>
            <Link to="/market" className="btn-primary">
              <LayoutGrid className="w-4 h-4" />
              前往工具市场
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card !p-4 mb-6 flex flex-wrap items-center gap-3"
            >
              <span className="text-sm text-gray-300 mr-1">
                已选择 <span className="text-primary-400 font-bold">{compareTools.length}</span> / {MAX_COMPARE_TOOLS} 个工具
                {compareTools.length < MAX_COMPARE_TOOLS && (
                  <span className="text-gray-500">（还可添加 {MAX_COMPARE_TOOLS - compareTools.length} 个）</span>
                )}
              </span>

              <div className="flex-1" />

              <Toggle
                checked={hideSame}
                onChange={setHideSame}
                icon={hideSame ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                label="隐藏相同项"
              />
              <Toggle
                checked={highlightDiff}
                onChange={setHighlightDiff}
                icon={<GitCompareArrows className="w-4 h-4" />}
                label="突出差异"
              />

              {compareTools.length < MAX_COMPARE_TOOLS && (
                <Link to="/market" className="btn-outline !px-3.5 !py-2 text-sm">
                  <Plus className="w-4 h-4" />
                  添加工具
                </Link>
              )}

              <button
                onClick={handleClear}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all',
                  confirmClear
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-dark-900 border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10'
                )}
              >
                <Trash2 className="w-4 h-4" />
                {confirmClear ? '再次点击确认清空' : '清空'}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card !p-0 overflow-x-auto"
            >
              <div
                className="min-w-[680px]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `minmax(140px, 200px) repeat(${compareTools.length}, minmax(160px, 1fr))`
                }}
              >
                {/* 表头 */}
                <div className="sticky left-0 z-20 bg-dark-900 px-4 py-4 border-b border-gray-800 flex items-center gap-2">
                  <GitCompareArrows className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-semibold text-white">对比项</span>
                </div>
                {compareTools.map((tool) => {
                  const categoryInfo = categories.find((c) => c.id === tool.category);
                  return (
                    <div key={tool.id} className="relative px-4 py-4 border-b border-l border-gray-800">
                      <button
                        onClick={() => handleRemove(tool)}
                        title="移出对比"
                        aria-label={`将 ${tool.name} 移出对比`}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link to={`/tool/${tool.id}`} className="flex flex-col items-center text-center group">
                        <div className="w-14 h-14 rounded-2xl bg-dark-900 p-2 overflow-hidden border border-gray-700/50 mb-3 group-hover:border-primary-500/50 transition-colors">
                          <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {tool.name}
                        </h3>
                        {categoryInfo && (
                          <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo.color} text-white/90`}>
                            {categoryInfo.name}
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}

                {visibleRows.length === 0 ? (
                  <div className="col-span-full py-16 text-center">
                    <EyeOff className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">
                      {compareTools.length === 1
                        ? '单个工具没有差异可对比，添加更多工具试试'
                        : '所选工具在这些维度上完全相同，没有差异项'}
                    </p>
                  </div>
                ) : (
                  <>
                    {renderRowGroup(baseRows, <LayoutGrid className="w-4 h-4 text-primary-400" />, '基础信息')}
                    {renderRowGroup(featureRows, <Check className="w-4 h-4 text-primary-400" />, '功能')}
                    {renderRowGroup(tagRows, <Tag className="w-4 h-4 text-primary-400" />, '标签')}
                  </>
                )}
              </div>
            </motion.div>

            <p className="text-center text-sm text-gray-500 mt-6">
              对比选择会自动保存，在市场、详情页之间切换或返回时保持一致
            </p>
          </>
        )}
      </div>
    </div>
  );
}
