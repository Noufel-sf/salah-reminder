import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Noor ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    if (window.confirm('هل تريد استعادة الإعدادات الافتراضية للتطبيق؟ سيتم تنظيف البيانات المؤقتة المخزنة محلياً.')) {
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#0b1411] text-[#ecf3ef] font-readex p-6 select-none" dir="rtl">
          <div className="max-w-md w-full bg-[#121f1a] border-2 border-emerald-800 p-8 shadow-2xl space-y-6 text-right">
            {/* Top Accent */}
            <div className="w-12 h-12 bg-rose-950/80 border border-rose-600/40 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100">
                حدث استثناء غير متوقع في تطبيق نور
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                لا تقلق، بياناتك الأساسية آمنة. يمكنك إعادة تشغيل التطبيق للمتابعة فوراً.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#0a110e] border border-emerald-950 text-[11px] font-mono text-rose-300 overflow-x-auto text-left">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <RotateCcw size={14} />
                <span>إعادة تشغيل التطبيق</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetData}
                className="py-2.5 px-3 bg-[#172620] hover:bg-[#20362c] text-slate-300 hover:text-white border border-[#233b31] font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="استعادة الإعدادات الافتراضية"
              >
                <Trash2 size={13} />
                <span>استعادة الافتراضي</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
