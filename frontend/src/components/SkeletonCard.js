import React from 'react';

const SkeletonPulse = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonKPICard = () => (
  <div className="bg-white rounded-xl shadow-card overflow-hidden">
    <SkeletonPulse className="h-2 rounded-none" />
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <SkeletonPulse className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg" />
        <SkeletonPulse className="w-20 h-6 rounded-full" />
      </div>
      <SkeletonPulse className="h-4 w-24 mb-2" />
      <SkeletonPulse className="h-8 w-16" />
    </div>
  </div>
);

export const SkeletonInventoryCard = () => (
  <div className="bg-white rounded-xl shadow-card overflow-hidden">
    <SkeletonPulse className="h-40 sm:h-48 rounded-none" />
    <div className="p-4 lg:p-5">
      <SkeletonPulse className="h-5 w-3/4 mb-3" />
      <div className="space-y-2 mb-4">
        <SkeletonPulse className="h-4 w-1/2" />
        <SkeletonPulse className="h-4 w-2/5" />
        <SkeletonPulse className="h-4 w-1/3" />
      </div>
      <SkeletonPulse className="h-2 w-full mb-4 rounded-full" />
      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <SkeletonPulse className="h-4 w-20" />
          <SkeletonPulse className="h-7 w-24" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonLeadRow = () => (
  <tr>
    <td className="px-4 lg:px-6 py-4"><SkeletonPulse className="h-4 w-28" /></td>
    <td className="px-4 lg:px-6 py-4"><SkeletonPulse className="h-4 w-24" /></td>
    <td className="px-4 lg:px-6 py-4"><SkeletonPulse className="h-4 w-36" /></td>
    <td className="px-4 lg:px-6 py-4"><SkeletonPulse className="h-4 w-28" /></td>
    <td className="px-4 lg:px-6 py-4 text-center"><SkeletonPulse className="h-4 w-8 mx-auto" /></td>
    <td className="px-4 lg:px-6 py-4 text-center"><SkeletonPulse className="h-6 w-16 mx-auto rounded-full" /></td>
  </tr>
);

export const SkeletonLeadCard = () => (
  <div className="bg-white rounded-xl shadow-card p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <SkeletonPulse className="h-5 w-32 mb-1" />
        <SkeletonPulse className="h-4 w-24" />
      </div>
      <div className="flex items-center space-x-2">
        <SkeletonPulse className="h-6 w-8" />
        <SkeletonPulse className="h-6 w-16 rounded-full" />
      </div>
    </div>
    <div className="space-y-1.5">
      <SkeletonPulse className="h-4 w-48" />
      <SkeletonPulse className="h-4 w-32" />
    </div>
  </div>
);

export const SkeletonActivityCard = () => (
  <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
    <div className="flex items-center justify-between mb-4">
      <SkeletonPulse className="h-5 w-32" />
      <SkeletonPulse className="h-4 w-16" />
    </div>
    <div className="space-y-2 lg:space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <SkeletonPulse className="w-12 h-12 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <SkeletonPulse className="h-4 w-3/4 mb-1" />
            <SkeletonPulse className="h-3 w-1/2" />
          </div>
          <SkeletonPulse className="h-4 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonPage = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b border-gray-200 shadow-sm mb-6 lg:mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <SkeletonPulse className="h-8 w-48 mb-2" />
        <SkeletonPulse className="h-4 w-72" />
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-card p-6">
            <SkeletonPulse className="h-6 w-3/4 mb-4" />
            <SkeletonPulse className="h-4 w-full mb-2" />
            <SkeletonPulse className="h-4 w-5/6 mb-6" />
            <SkeletonPulse className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonCard = SkeletonKPICard;
export default SkeletonCard;
