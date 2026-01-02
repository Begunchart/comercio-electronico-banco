import { ShoppingBag, Coffee, Zap, Smartphone, ShoppingCart, ArrowUpRight } from 'lucide-react';

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: 'shopping' | 'food' | 'utilities' | 'electronics' | 'groceries';
  status: 'completed' | 'pending';
}

const mockTransactions: Transaction[] = [];

export function TransactionsList() {
  const getIcon = (category: Transaction['category']) => {
    switch (category) {
      case 'shopping':
        return <ShoppingBag className="w-5 h-5" />;
      case 'food':
        return <Coffee className="w-5 h-5" />;
      case 'utilities':
        return <Zap className="w-5 h-5" />;
      case 'electronics':
        return <Smartphone className="w-5 h-5" />;
      case 'groceries':
        return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const getIconBg = (category: Transaction['category']) => {
    switch (category) {
      case 'shopping':
        return 'bg-purple-100 text-purple-600';
      case 'food':
        return 'bg-orange-100 text-orange-600';
      case 'utilities':
        return 'bg-yellow-100 text-yellow-600';
      case 'electronics':
        return 'bg-blue-100 text-blue-600';
      case 'groceries':
        return 'bg-green-100 text-green-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Transacciones Recientes</h2>
        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
          Ver todas
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {mockTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconBg(transaction.category)}`}>
                {getIcon(transaction.category)}
              </div>
              <div>
                <p className="text-gray-900">{transaction.merchant}</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500">{transaction.date}</p>
                  {transaction.status === 'pending' && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-900">
              -${transaction.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {mockTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay transacciones recientes</p>
        </div>
      )}
    </div>
  );
}
