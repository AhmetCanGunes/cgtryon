import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight, X, RefreshCw } from 'lucide-react';
import { CreditPackage, calculateTRYPrice } from '../types';
import { getPackagesWithCurrentPrices, formatPrice } from '../services/exchangeRateService';

interface PricingPageProps {
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
  currentCredits: number;
}

interface PackageWithPrice extends CreditPackage {
  exchangeRate?: number;
}

const PricingPage: React.FC<PricingPageProps> = ({ onClose, onSelectPackage, currentCredits }) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number>(0);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const packagesWithPrices = await getPackagesWithCurrentPrices();
      setPackages(packagesWithPrices);
      if (packagesWithPrices[0]?.exchangeRate) {
        setExchangeRate(packagesWithPrices[0].exchangeRate);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'starter':
        return <Zap size={24} />;
      case 'professional':
        return <Crown size={24} />;
      case 'business':
        return <Building2 size={24} />;
      case 'enterprise':
        return <Building2 size={28} />;
      default:
        return <Zap size={24} />;
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = {
      gray: {
        border: 'border-gray-200',
        gradient: 'from-gray-50 to-gray-100',
        button: 'bg-gray-900 hover:bg-black',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700'
      },
      violet: {
        border: 'border-secondary',
        gradient: 'from-primary/10 to-indigo-50',
        button: 'bg-primary hover:bg-primary',
        icon: 'text-primary',
        badge: 'bg-primary/20 text-primary'
      },
      indigo: {
        border: 'border-indigo-300',
        gradient: 'from-indigo-50 to-blue-50',
        button: 'bg-indigo-600 hover:bg-indigo-700',
        icon: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-700'
      },
      amber: {
        border: 'border-amber-300',
        gradient: 'from-amber-50 to-orange-50',
        button: 'bg-amber-600 hover:bg-amber-700',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700'
      }
    };

    return baseClasses[color as keyof typeof baseClasses] || baseClasses.gray;
  };

  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg.id);
    // Simulate payment process (you'll integrate real payment later)
    setTimeout(() => {
      onSelectPackage(pkg.id);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 p-4 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="bg-white rounded-3xl max-w-5xl w-full relative shadow-2xl">
          {/* Close Button - Outside modal, top right */}
          <button
            onClick={onClose}
            className="fixed top-8 right-8 z-[60] p-3 rounded-full bg-white hover:bg-gray-100 transition-all shadow-2xl hover:scale-110"
          >
            <X size={24} className="text-gray-700" />
          </button>


        {/* Pricing Cards */}
        <div className="p-8 bg-gray-50 rounded-t-3xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw size={32} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-sm text-gray-600">Güncel fiyatlar yükleniyor...</p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {packages.map((pkg) => {
              const colors = getColorClasses(pkg.color, selectedPackage === pkg.id);
              const isPopular = pkg.popular;

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-2xl border ${
                    isPopular 
                      ? 'border-secondary shadow-2xl transform scale-105 ring-2 ring-primary/30' 
                      : 'border-gray-200 shadow-lg hover:shadow-xl'
                  } p-6 transition-all duration-300 hover:-translate-y-1 ${
                    selectedPackage === pkg.id ? 'ring-4 ring-secondary border-secondary' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="inline-block bg-gradient-to-r from-primary to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                        🔥 EN POPÜLER
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-50 flex items-center justify-center mb-4 ${colors.icon}`}>
                    {getPackageIcon(pkg.id)}
                  </div>

                  {/* Package Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                        ${pkg.priceUSD}
                      </span>
                      <span className="text-sm text-gray-400 font-medium">USD</span>
                    </div>
                  </div>

                  {/* Credits Badge */}
                  <div className="mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-indigo-50 border border-primary/20 rounded-lg">
                      <Zap size={16} className="text-primary" />
                      <span className="text-sm font-bold text-primary">{pkg.credits} Kredi</span>
                    </div>
                  </div>

                  {/* Estimated Generations */}
                  <p className="text-xs text-gray-500 mb-4 font-medium">
                    {pkg.estimatedGenerations}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check size={12} className="text-green-600" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    disabled={selectedPackage === pkg.id}
                    className={`w-full py-3.5 ${
                      isPopular 
                        ? 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-700' 
                        : 'bg-gray-900 hover:bg-black'
                    } text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl transform hover:scale-[1.02]`}
                  >
                    {selectedPackage === pkg.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Satın Al</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-8 py-6 rounded-b-3xl">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Güvenli Ödeme</p>
                  <p className="text-xs text-gray-500">256-bit SSL şifreleme</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Anında Aktif</p>
                  <p className="text-xs text-gray-500">Hemen kullanmaya başlayın</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Crown size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">7/24 Destek</p>
                  <p className="text-xs text-gray-500">
                    <a href="mailto:destek@cgtryon.com" className="text-primary hover:underline">destek@cgtryon.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

