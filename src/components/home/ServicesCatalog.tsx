'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_CATEGORIES, type ServiceItem } from '@/data/services';

interface ServicesCatalogProps {
  servicesList: ServiceItem[];
}

export default function ServicesCatalog({ servicesList }: ServicesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [directorySearch, setDirectorySearch] = useState('');
  const [isAllServicesExpanded, setIsAllServicesExpanded] = useState(false);

  const filteredServices = useMemo(() => {
    return servicesList.filter((service) => {
      const matchesCategory =
        activeCategory === 'all' ||
        service.category === activeCategory ||
        (activeCategory === 'trademark-ipr' && (service.category === 'trademark-ipr' || service.category === 'copyright'));

      const matchesSearch =
        !directorySearch.trim() ||
        service.title.toLowerCase().includes(directorySearch.toLowerCase().trim()) ||
        service.desc.toLowerCase().includes(directorySearch.toLowerCase().trim()) ||
        service.slug.toLowerCase().includes(directorySearch.toLowerCase().trim());

      return matchesCategory && matchesSearch;
    });
  }, [servicesList, activeCategory, directorySearch]);

  const INITIAL_VISIBLE_SERVICES = 8;
  const displayedServices = useMemo(() => {
    if (directorySearch.trim() || activeCategory !== 'all' || isAllServicesExpanded) {
      return filteredServices;
    }
    return filteredServices.slice(0, INITIAL_VISIBLE_SERVICES);
  }, [filteredServices, activeCategory, directorySearch, isAllServicesExpanded]);

  return (
    <section id="catalog-section" className="space-y-6 scroll-mt-24">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase text-[#0E7490] tracking-wider block">
            Official Statutory Catalog
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
            All Services ({servicesList.length} Offerings)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Choose a category or search for corporate, IP, tax, or legal filings.
          </p>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
            placeholder="Filter services by name..."
            aria-label="Filter services by name"
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E7490] shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveCategory('all');
            setIsAllServicesExpanded(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({servicesList.length})
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              setIsAllServicesExpanded(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Clean Responsive Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pt-1">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            No services match your search query. Try another keyword.
          </div>
        ) : (
          displayedServices.map((srv) => {
            const isAdvanceEligible = srv.price > 1000;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-lg hover:border-[#0E7490]/60 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl p-2 bg-slate-50 rounded-xl border border-slate-100">
                      {srv.icon}
                    </span>
                    <span className="bg-[#FFF4D9] text-[#073B5C] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/70">
                      {srv.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[#073B5C] text-sm leading-snug line-clamp-2">
                      {srv.title}
                    </h3>
                    <p className="text-slate-600 text-xs mt-1.5 leading-relaxed line-clamp-2">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                    <span className="text-slate-500">Timeline:</span>
                    <strong className="text-slate-800">{srv.sla}</strong>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Starting Fee</span>
                    <strong className="text-base font-black text-[#073B5C]">
                      ₹{srv.price.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <Link
                    href={`/services/${srv.slug}`}
                    className="bg-[#073B5C] group-hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs py-2.5 px-3.5 rounded-xl text-center transition"
                  >
                    {isAdvanceEligible ? 'Start ₹999 →' : 'Apply →'}
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Expand / Collapse Bar */}
      {activeCategory === 'all' && !directorySearch.trim() && filteredServices.length > INITIAL_VISIBLE_SERVICES && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs sm:text-sm text-slate-600">
            Showing <strong className="text-[#073B5C]">{displayedServices.length}</strong> of{' '}
            <strong className="text-[#073B5C]">{filteredServices.length}</strong> services
          </div>

          <button
            type="button"
            onClick={() => setIsAllServicesExpanded(!isAllServicesExpanded)}
            className="px-5 py-2.5 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {isAllServicesExpanded
              ? '▲ Show Top 8 Services'
              : `▼ View All ${filteredServices.length} Services (${filteredServices.length - INITIAL_VISIBLE_SERVICES} More)`}
          </button>
        </div>
      )}
    </section>
  );
}
