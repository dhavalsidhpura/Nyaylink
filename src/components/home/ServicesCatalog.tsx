'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_CATEGORIES, type ServiceItem } from '@/data/services';
import { getPricingModelBadge } from '@/lib/pricing';

interface ServicesCatalogProps {
  servicesList: ServiceItem[];
}

export default function ServicesCatalog({ servicesList }: ServicesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [directorySearch, setDirectorySearch] = useState('');
  const [mobileCatalogLayout, setMobileCatalogLayout] = useState<'grid' | 'horizontal'>('grid');
  const [isAllServicesExpanded, setIsAllServicesExpanded] = useState(false);

  // Filtered Catalog Services
  const filteredServices = useMemo(() => {
    return servicesList.filter((service) => {
      const matchesCategory =
        activeCategory === 'all' ||
        service.category === activeCategory ||
        (activeCategory === 'company-reg' && service.category === 'company-reg') ||
        (activeCategory === 'tax-accounting' && service.category === 'tax-accounting') ||
        (activeCategory === 'trademark-ipr' && (service.category === 'trademark-ipr' || service.category === 'copyright')) ||
        (activeCategory === 'licenses-permits' && service.category === 'licenses-permits') ||
        (activeCategory === 'business-tech' && service.category === 'business-tech');

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
    if (directorySearch.trim() || activeCategory !== 'all') {
      return filteredServices;
    }
    if (isAllServicesExpanded) {
      return filteredServices;
    }
    return filteredServices.slice(0, INITIAL_VISIBLE_SERVICES);
  }, [filteredServices, activeCategory, directorySearch, isAllServicesExpanded]);

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
            Official Statutory Catalog
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#073B5C]">
            Services Directory ({servicesList.length} Offerings)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a vertical or use search to find exact corporate, IP, or tax filings.
          </p>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
            placeholder="Filter services by name..."
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0E7490] shadow-xs"
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
          className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Verticals ({servicesList.length})
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              setIsAllServicesExpanded(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-[#073B5C] text-[#F4B942] shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile View Switcher: 2×2 Grid vs 2×1 Horizontal List */}
      <div className="flex sm:hidden items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-[11px] font-extrabold text-[#073B5C]">
          Mobile View:
        </span>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setMobileCatalogLayout('grid')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
              mobileCatalogLayout === 'grid'
                ? 'bg-white text-[#073B5C] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>⊞</span> 2×2 Grid
          </button>
          <button
            type="button"
            onClick={() => setMobileCatalogLayout('horizontal')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
              mobileCatalogLayout === 'horizontal'
                ? 'bg-white text-[#073B5C] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>☰</span> 2×1 List
          </button>
        </div>
      </div>

      {/* 2×1 Horizontal List View for Mobile (sm:hidden) */}
      {mobileCatalogLayout === 'horizontal' && (
        <div className="space-y-2.5 sm:hidden">
          {filteredServices.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No services match your search query. Try typing another term.
            </div>
          ) : (
            displayedServices.map((srv) => (
              <Link
                key={srv.id}
                href={`/services/${srv.slug}`}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition hover:border-[#0E7490]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                    {srv.icon}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[#073B5C] text-xs leading-snug truncate">
                      {srv.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-medium flex-wrap">
                      <span className="truncate">⏱️ {srv.sla}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold shrink-0">₹999 Token</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${getPricingModelBadge(srv.slug, srv.category).badgeClass}`}>
                        {getPricingModelBadge(srv.slug, srv.category).shortBadge}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#073B5C] block">
                    ₹{srv.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] bg-[#073B5C] text-[#F4B942] font-black px-2.5 py-1 rounded-lg mt-0.5 inline-block">
                    Start →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Dynamic Responsive Service Cards Grid (2×2 on Mobile, 3-4 across on Desktop) */}
      <div
        className={`${
          mobileCatalogLayout === 'horizontal' ? 'hidden sm:grid' : 'grid'
        } grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2.5 sm:gap-6 pt-1`}
      >
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No services match your search query. Try typing another term.
          </div>
        ) : (
          displayedServices.map((srv) => {
            const isAdvanceEligible = srv.price > 1000;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:border-[#0E7490]/50 transition-all group duration-200"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xl sm:text-2xl p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:scale-105 transition-transform">
                      {srv.icon}
                    </span>
                    <span className="bg-[#FFF4D9] text-[#073B5C] text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-200/60 truncate max-w-[85px] sm:max-w-[130px]">
                      {srv.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[#073B5C] text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                      {srv.title}
                    </h3>
                    
                    {/* Statutory Pricing Transparency Pill */}
                    <div className="pt-1.5 pb-0.5">
                      <span
                        className={`inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getPricingModelBadge(srv.slug, srv.category).badgeClass}`}
                        title={getPricingModelBadge(srv.slug, srv.category).tooltip}
                      >
                        {getPricingModelBadge(srv.slug, srv.category).label}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2 min-h-[2rem] hidden sm:block">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Timeline:</span>
                      <strong className="text-slate-800 truncate ml-1">{srv.sla}</strong>
                    </div>
                    <div className="hidden sm:flex justify-between items-center">
                      <span className="text-slate-400">Govt Fee:</span>
                      <span className="text-slate-500 truncate max-w-[140px] text-right" title={srv.govtFee}>
                        {srv.govtFee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro-Commitment Card Footer with ₹999 Advance Anchor */}
                <div className="pt-2 sm:pt-3 mt-3 sm:mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold block uppercase">
                      Package Fee
                    </span>
                    <strong className="text-xs sm:text-base font-black text-[#073B5C]">
                      ₹{srv.price.toLocaleString()}
                    </strong>
                  </div>

                  <Link
                    href={`/services/${srv.slug}`}
                    className="bg-[#073B5C] group-hover:bg-[#0E7490] text-[#F4B942] font-black text-[11px] sm:text-xs py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl uppercase tracking-wider text-center transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isAdvanceEligible ? 'Start ₹999 →' : 'Apply →'}
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Progressive Disclosure Banner for "All Verticals" (Curated 8 vs Full 58) */}
      {activeCategory === 'all' && !directorySearch.trim() && filteredServices.length > INITIAL_VISIBLE_SERVICES && (
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-white via-cyan-50/40 to-white rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-xs font-bold text-[#073B5C]">
              Showing <span className="font-black text-[#0E7490]">{displayedServices.length}</span> of <span className="font-black">{filteredServices.length}</span> Services
            </div>
            <p className="text-[11px] text-slate-500">
              {isAllServicesExpanded
                ? 'Showing the entire catalog across Company Registration, Tax & GST, Trademark, and Legal Services.'
                : `Showing top ${INITIAL_VISIBLE_SERVICES} popular services. Choose a category above or view all ${filteredServices.length} offerings.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAllServicesExpanded(!isAllServicesExpanded)}
              className="px-5 py-2.5 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <span>
                {isAllServicesExpanded
                  ? '▲ Show Top 8 Services'
                  : `▼ Show All ${filteredServices.length} Services (${filteredServices.length - INITIAL_VISIBLE_SERVICES} More)`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
