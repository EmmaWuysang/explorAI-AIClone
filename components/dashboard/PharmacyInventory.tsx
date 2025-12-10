'use client'

import { useState, useEffect } from 'react'
import { getPharmacies, getInventory, purchaseItem, restockItem } from '@/lib/actions/pharmacy'
import { Search, MapPin, Pill, DollarSign, User, ShieldCheck, ShoppingCart, PlusCircle, Package } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

type Pharmacy = {
  id: string
  name: string
  address: string
  phone: string
}

type InventoryItem = {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    description: string
    category: string
    manufacturer: string
  }
}

type UserRole = 'client' | 'pharmacist'

interface PharmacyInventoryProps {
  mode: UserRole
}

export default function PharmacyInventory({ mode }: PharmacyInventoryProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  // const [userRole, setUserRole] = useState<UserRole>('client') // Removed internal state
  const [providerPharmacyId, setProviderPharmacyId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const userRole = mode; // Use prop instead

  const { addToast } = useToast();
  useEffect(() => {
    const fetchPharmacies = async () => {
      const res = await getPharmacies()
      if (res.success && res.data) {
        setPharmacies(res.data)
      }
    }
    fetchPharmacies()
  }, [])

  useEffect(() => {
    // If pharmacist, only show their pharmacy's inventory (simulated by providerPharmacyId)
    // In a real app, this would come from the user's session/profile
    const targetPharmacyId = userRole === 'pharmacist' ? providerPharmacyId : selectedPharmacy

    if (targetPharmacyId) {
      const fetchInventory = async () => {
        setLoading(true)
        const res = await getInventory(targetPharmacyId)
        if (res.success && res.data) {
          setInventory(res.data)
        }
        setLoading(false)
      }
      fetchInventory()
    } else {
      setInventory([])
    }
  }, [selectedPharmacy, userRole, providerPharmacyId])

  // Removed handleRoleSwitch

  const handlePurchase = async (item: InventoryItem) => {
    if (processingId) return
    setProcessingId(item.id)
    
    const res = await purchaseItem(item.id, 1) // Buy 1 for now
    if (res.success) {
      // Optimistic update or refetch
      setInventory(prev => prev.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      ))
    } else {
      alert(res.error)
    }
    setProcessingId(null)
  }

  const handleRestock = async (item: InventoryItem) => {
    if (processingId) return
    setProcessingId(item.id)

    const res = await restockItem(item.id, 10) // Restock 10
    if (res.success) {
       setInventory(prev => prev.map(i => 
        i.id === item.id ? { ...i, incomingStock: ((i as any).incomingStock || 0) + 10 } : i
      ))
      addToast("Restock request submitted successfully! (+10 pending)", 'success')
    } else {
      addToast(res.error, 'error')
    }
    setProcessingId(null)
  }

  const filteredInventory = inventory.filter(item => 
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Auto-select first pharmacy for pharmacist mode if not set
  useEffect(() => {
      if (mode === 'pharmacist' && pharmacies.length > 0 && !providerPharmacyId) {
          setProviderPharmacyId(pharmacies[0].id)
          setSelectedPharmacy(pharmacies[0].id)
      }
  }, [mode, pharmacies, providerPharmacyId])


  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Pill className="w-6 h-6 text-cyan-600" />
          Pharmacy Inventory
        </h2>
        
        {/* Role Switcher Removed */}
      </div>

      {userRole === 'pharmacist' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3 text-emerald-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-bold">Pharmacist Mode Active</div>
              <div className="text-sm opacity-80">
                Managing inventory for: <span className="font-semibold text-emerald-900">{pharmacies.find(p => p.id === providerPharmacyId)?.name}</span>
              </div>
            </div>
            <div className="ml-auto">
               <select 
                  value={providerPharmacyId || ''} 
                  onChange={(e) => {
                      setProviderPharmacyId(e.target.value)
                      setSelectedPharmacy(e.target.value)
                  }}
                  className="bg-white border border-emerald-500/30 rounded px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
               >
                   {pharmacies.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                   ))}
               </select>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {inventory.some(i => i.quantity < 10) && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h3 className="text-amber-700 font-bold flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Low Stock Alerts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inventory.filter(i => i.quantity < 10).map(item => (
                  <div key={item.id} className="bg-white p-3 rounded border border-amber-200 shadow-sm flex justify-between items-center">
                    <div>
                      <div className="text-slate-900 font-medium">{item.product.name}</div>
                      <div className="text-xs text-amber-600 font-medium">
                        {item.quantity} remaining
                        {(item as any).incomingStock > 0 && <span className="text-blue-600 ml-1">(+{(item as any).incomingStock} pending)</span>}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-7 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                      onClick={() => handleRestock(item)}
                      disabled={processingId === item.id}
                    >
                      Restock
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pharmacy List (Hidden in Pharmacist Mode usually, but let's keep it for context or hide it) */}
        {userRole === 'client' && (
            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Select Pharmacy</h3>
            <div className="space-y-2">
                {pharmacies.map(pharmacy => (
                <button
                    key={pharmacy.id}
                    onClick={() => setSelectedPharmacy(pharmacy.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedPharmacy === pharmacy.id
                        ? 'bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    } border`}
                >
                    <div className="font-medium">{pharmacy.name}</div>
                    <div className="text-sm opacity-70 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {pharmacy.address}
                    </div>
                </button>
                ))}
            </div>
            </div>
        )}

        {/* Inventory List */}
        <div className={`${userRole === 'client' ? 'md:col-span-2' : 'md:col-span-3'} space-y-4`}>
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-slate-700">
               {userRole === 'pharmacist' 
                 ? 'Manage Inventory'
                 : selectedPharmacy 
                     ? `Inventory at ${pharmacies.find(p => p.id === selectedPharmacy)?.name}`
                     : 'Select a pharmacy to view inventory'
               }
             </h3>
             {(selectedPharmacy || userRole === 'pharmacist') && (
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   placeholder="Search medications..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-white border border-slate-200 rounded-full py-2 pl-9 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                 />
               </div>
             )}
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-200 min-h-[300px] max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Loading inventory...
              </div>
            ) : (!selectedPharmacy && userRole === 'client') ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Please select a pharmacy from the list
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                No products found
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredInventory.map(item => (
                  <div key={item.id} className="p-4 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 group-hover:text-cyan-700 transition-colors text-lg">
                          {item.product.name}
                        </span>
                        {item.quantity < 5 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 leading-relaxed">
                        {item.product.description}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                          {item.product.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {item.product.manufacturer}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[140px]">
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                          <DollarSign className="w-5 h-5" />
                          {item.price.toFixed(2)}
                        </div>
                        <div className={`text-sm mt-0.5 ${
                          item.quantity > 20 ? 'text-slate-400' : 'text-amber-600 font-medium'
                        }`}>
                          {item.quantity} in stock
                        </div>
                      </div>
                      
                      {userRole === 'client' ? (
                        <Button 
                            size="sm" 
                            variant="primary" 
                            className={`h-9 px-4 text-xs transition-all ${
                              processingId === item.id 
                                ? 'bg-slate-200 cursor-not-allowed text-slate-400' 
                                : 'bg-cyan-600 hover:bg-cyan-700 shadow-md shadow-cyan-500/20 text-white'
                            }`}
                            onClick={() => handlePurchase(item)}
                            disabled={item.quantity === 0 || processingId === item.id}
                        >
                            {processingId === item.id ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                                  Buying...
                                </span>
                            ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                                  Buy Now
                                </>
                            )}
                        </Button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                            {(item as any).incomingStock > 0 && (
                                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                    <Package size={8} /> {(item as any).incomingStock} Pending
                                </span>
                            )}
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-9 px-4 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                onClick={() => handleRestock(item)}
                                disabled={processingId === item.id}
                            >
                                {processingId === item.id ? (
                                    <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                                    Adding...
                                    </span>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4 mr-1.5" />
                                        Restock (+10)
                                    </>
                                )}
                            </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
