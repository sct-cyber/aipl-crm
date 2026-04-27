import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { KPIMetrics } from '../types';
import { Card, Button, Input } from '../components/ui';
import { 
  BarChart3, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  Calculator
} from 'lucide-react';

export default function KPIsView() {
  const [kpis, setKPIs] = useState<KPIMetrics[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    weekEnding: new Date().toISOString().split('T')[0],
    newBOQAddedCr: 0,
    crrNbdBOQ: 0,
    nbdBOQ: 0,
    noOfBOQReceived: 0,
    orderBookingCr: 0,
    noOfOrderBooking: 0,
    newGPCr: 0,
    newGPPercent: 0,
    averageRsSale: 0,
    averageGP: 0,
    averageBOQReceived: 0,
  });

  useEffect(() => {
    const unsub = crmService.subscribeToKPIs((data) => {
      setKPIs(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crmService.addKPI(formData);
    setShowAddModal(false);
    setFormData({
      weekEnding: new Date().toISOString().split('T')[0],
      newBOQAddedCr: 0,
      crrNbdBOQ: 0,
      nbdBOQ: 0,
      noOfBOQReceived: 0,
      orderBookingCr: 0,
      noOfOrderBooking: 0,
      newGPCr: 0,
      newGPPercent: 0,
      averageRsSale: 0,
      averageGP: 0,
      averageBOQReceived: 0,
    });
  };

  const KPISlot = ({ label, value, unit = "" }: { label: string, value: number, unit?: string }) => (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-brand-secondary">{value}{unit}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">Weekly KPIs</h1>
          <p className="text-brand-muted text-sm font-medium">Track your weekly performance and BOQ metrics.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus size={18} />
          Add Weekly KPI
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="p-6 hover:border-brand-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-secondary">Week Ending</h3>
                  <p className="text-xs font-bold text-brand-muted">{new Date(kpi.weekEnding).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle2 size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <KPISlot label="BOQ Added" value={kpi.newBOQAddedCr} unit=" Cr" />
              <KPISlot label="Order Booking" value={kpi.orderBookingCr} unit=" Cr" />
              <KPISlot label="New GP" value={kpi.newGPCr} unit=" Cr" />
              <KPISlot label="GP %" value={kpi.newGPPercent} unit="%" />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-muted font-bold uppercase tracking-wider">CRR-NBD BOQ</span>
                <span className="text-brand-secondary font-black">{kpi.crrNbdBOQ}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-muted font-bold uppercase tracking-wider">NBD-BOQ</span>
                <span className="text-brand-secondary font-black">{kpi.nbdBOQ}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-muted font-bold uppercase tracking-wider">No. of Orders</span>
                <span className="text-brand-secondary font-black">{kpi.noOfOrderBooking}</span>
              </div>
            </div>
          </Card>
        ))}

        {kpis.length === 0 && (
          <div className="lg:col-span-3 py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
              <BarChart3 size={40} />
            </div>
            <p className="text-gray-400 font-bold">No KPI entries yet.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-brand-primary font-black hover:underline"
            >
              Add your first weekly entry
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-brand-secondary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-brand-secondary">Weekly KPI Entry</h2>
                <p className="text-sm text-brand-muted font-medium">Please enter the values for the week.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowUpRight className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Week Ending</label>
                  <Input 
                    type="date" 
                    value={formData.weekEnding}
                    onChange={e => setFormData({...formData, weekEnding: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-4 pt-4 col-span-2">
                   <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest border-b border-brand-primary/10 pb-2">BOQ Metrics</h3>
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">New BOQ Added (Cr)</label>
                      <Input type="number" step="0.01" value={formData.newBOQAddedCr} onChange={e => setFormData({...formData, newBOQAddedCr: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">No. of BOQ Received</label>
                      <Input type="number" value={formData.noOfBOQReceived} onChange={e => setFormData({...formData, noOfBOQReceived: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">CRR-NBD BOQ</label>
                      <Input type="number" value={formData.crrNbdBOQ} onChange={e => setFormData({...formData, crrNbdBOQ: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">NBD-BOQ</label>
                      <Input type="number" value={formData.nbdBOQ} onChange={e => setFormData({...formData, nbdBOQ: Number(e.target.value)})} />
                    </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4 col-span-2">
                   <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest border-b border-brand-primary/10 pb-2">Sales & Booking</h3>
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Order Booking (Cr)</label>
                      <Input type="number" step="0.01" value={formData.orderBookingCr} onChange={e => setFormData({...formData, orderBookingCr: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">No. of Order booking</label>
                      <Input type="number" value={formData.noOfOrderBooking} onChange={e => setFormData({...formData, noOfOrderBooking: Number(e.target.value)})} />
                    </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4 col-span-2">
                   <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest border-b border-brand-primary/10 pb-2">GP Metrics</h3>
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">New GP (Cr)</label>
                      <Input type="number" step="0.01" value={formData.newGPCr} onChange={e => setFormData({...formData, newGPCr: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">New GP %</label>
                      <Input type="number" step="0.1" value={formData.newGPPercent} onChange={e => setFormData({...formData, newGPPercent: Number(e.target.value)})} />
                    </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4 col-span-2">
                   <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest border-b border-brand-primary/10 pb-2">Averages</h3>
                   <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Avg Sale</label>
                      <Input type="number" value={formData.averageRsSale} onChange={e => setFormData({...formData, averageRsSale: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Avg GP</label>
                      <Input type="number" value={formData.averageGP} onChange={e => setFormData({...formData, averageGP: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Avg BOQ</label>
                      <Input type="number" value={formData.averageBOQReceived} onChange={e => setFormData({...formData, averageBOQReceived: Number(e.target.value)})} />
                    </div>
                   </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                <Button variant="primary" type="submit" className="flex-1">Save Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
