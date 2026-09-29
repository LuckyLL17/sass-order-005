import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ToastType } from '@/store/useStore';

const toastStyles: Record<ToastType, { icon: typeof Info; iconClass: string; borderClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-green-400', borderClass: 'border-green-500/40' },
  error: { icon: AlertCircle, iconClass: 'text-red-400', borderClass: 'border-red-500/40' },
  info: { icon: Info, iconClass: 'text-primary-400', borderClass: 'border-primary-500/40' },
};

export default function Toast() {
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-full max-w-md px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`glass rounded-xl border ${toastStyles[toast.type].borderClass} px-4 py-3 flex items-center gap-3 shadow-xl pointer-events-auto`}
            role="status"
          >
            {(() => {
              const { icon: Icon, iconClass } = toastStyles[toast.type];
              return <Icon className={`w-5 h-5 flex-shrink-0 ${iconClass}`} />;
            })()}
            <span className="text-sm text-gray-200 flex-1">{toast.message}</span>
            <button
              onClick={hideToast}
              className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors flex-shrink-0"
              aria-label="关闭提示"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
