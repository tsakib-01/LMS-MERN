import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingBag, MessageCircle } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-6">
        
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <XCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Checkout Cancelled</h2>
          <p className="text-sm text-slate-500">
            You have successfully exited the payment portal. No funds were processed or deducted from your account.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => navigate('/courses')}
            className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-slate-300" />
            Browse Other Courses
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
          >
            Return to Previous Page
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Need help or experiencing technical difficulties? Let us know on the <span className="underline hover:text-slate-600 cursor-pointer" onClick={() => navigate('/contact')}>Contact Support</span> page.
        </p>

      </div>
    </div>
  );
};

export default PaymentCancel;
