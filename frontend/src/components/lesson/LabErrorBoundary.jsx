import React from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

class LabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Lab Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center p-6 bg-slate-900 rounded-[1.5rem] border border-slate-800 text-center" dir="rtl">
          <div className="max-w-md">
            <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mb-3 mx-auto">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-base md:text-lg font-black text-white mb-4">حدث خطأ في المختبر</h2>
            <p className="text-slate-400 mb-4 font-medium">
              نعتذر عن هذا العطل التقني. قد يكون هناك تضارب في البيانات أو مشكلة في التحميل.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  this.setState({ hasError: false });
                  if (this.props.onReset) this.props.onReset();
                }}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
              >
                <RotateCcw size={20} /> إعادة المحاولة
              </button>
              <button 
                onClick={() => {
                  if (this.props.onBack) this.props.onBack();
                }}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
              >
                <Home size={20} /> العودة للقائمة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LabErrorBoundary;
