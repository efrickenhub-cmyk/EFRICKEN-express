import React from 'react';
import { MapPin, Phone, Building2, CheckCircle2, Navigation } from 'lucide-react';
import { Branch, ServiceZone } from '../../types';

interface CoveragePageProps {
  zones: ServiceZone[];
  branches: Branch[];
}

export const CoveragePage: React.FC<CoveragePageProps> = ({ zones, branches }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Network Operations & Facilities
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Delivery Coverage & Branch Network
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Efricken Express operates primary sorting hubs, localized express depots, and strategic zone corridors across Kenya.
        </p>
      </div>

      {/* Regional Branches Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-500" />
          <span>Primary Hubs & Physical Sorting Branches</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-amber-400 transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {b.code}
                </span>
                <span className="text-xs font-bold text-slate-500">{b.county} County</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{b.name}</h3>
                <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Depot Manager</span>
                  <span className="font-semibold text-slate-800">{b.manager}</span>
                </div>
                <a
                  href={`tel:${b.phone}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{b.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Service Zones Matrix */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-amber-500" />
          <span>Active Route Bands & Service Zones</span>
        </h2>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Service Zone</th>
                  <th className="py-3.5 px-4">County</th>
                  <th className="py-3.5 px-4">Assigned Parent Hub</th>
                  <th className="py-3.5 px-4">Standard Delivery SLA</th>
                  <th className="py-3.5 px-4">Zone Tariff Band</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {zones.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{z.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{z.county}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{z.hubBranch}</td>
                    <td className="py-3.5 px-4 text-slate-800">~{z.estimatedHours} Hours</td>
                    <td className="py-3.5 px-4 font-mono text-amber-600">
                      {z.baseRateMultiplier}x Base
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
