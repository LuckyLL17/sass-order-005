import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ToastType } from '@/types';
import { cn } from '@/lib/utils';

const toastConfig: Record<ToastType, { icon: typeof Info; className: string }> = {
  info: {
    icon: Info,
    className: 'border-secondary-500/40 text-secondary-400',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-green-500/40 text-green-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-gold-500/40 text-gold-400',
  },
  error: {
    icon: XCircle,
    className: 'border-red-500/40 text-red-400',
  },
};

export default function Toaster() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl',
                'border',
                config.className
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-200">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 text-gray-500 hover:text-white transition-colors flex-shrink-0"
                aria-label="关闭提示"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
