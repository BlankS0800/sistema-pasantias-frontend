import React from 'react';
import { Target, Eye, Rocket } from 'lucide-react';

interface VerticalInfoSectionProps {
  title: string;
  content: string;
  type: 'mision' | 'vision' | 'objetivo';
}

const IconMap = {
  mision: Target,
  vision: Eye,
  objetivo: Rocket
};

export const VerticalInfoSection: React.FC<VerticalInfoSectionProps> = ({ title, content, type }) => {
  const SelectedIcon = IconMap[type];

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-12 border-b border-light-gray last:border-0 group">
      <div className="p-6 bg-white-main rounded-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
        <SelectedIcon className="w-10 h-10 text-main-green" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl font-montserrat font-bold text-institucional-blue mb-3">
          {title}
        </h2>
        <p className="text-dark-gray text-lg leading-relaxed max-w-4xl font-poppins">
          {content}
        </p>
      </div>
    </div>
  );
};