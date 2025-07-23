import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ChineseCardProps {
  title?: string;
  subtitle?: string;
  content?: string;
  variant?: 'default' | 'elegant' | 'minimal';
  className?: string;
  children?: React.ReactNode;
}

const ChineseCard: React.FC<ChineseCardProps> = ({
  title = "传统文化",
  subtitle = "Traditional Culture",
  content = "探索中华文明的深厚底蕴，感受千年文化的独特魅力。从古代哲学到现代应用，传承与创新并重。",
  variant = 'default',
  className,
  children
}) => {
  const variants = {
    default: "bg-gradient-to-br from-red-50 to-amber-50 border-red-200 hover:border-red-300",
    elegant: "bg-gradient-to-br from-slate-50 to-red-50 border-slate-200 hover:border-red-200",
    minimal: "bg-white border-gray-200 hover:border-red-200"
  };

  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 group cursor-pointer",
      variants[variant],
      className
    )}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-amber-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
          </div>
        </div>
        
        <div className="pl-7">
          <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>

        {children && (
          <div className="pl-7 pt-2">
            {children}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center group-hover:from-red-200 group-hover:to-amber-200 transition-all duration-300">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-amber-500 group-hover:scale-110 transition-transform"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChineseCard;
