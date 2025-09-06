import React from 'react';

const InfoCard = ({ title, subtitle, rightNode, children, className = '' }) => (
  <div
    className={`
      group rounded-2xl border border-border/60 bg-card/80
      shadow-sm hover:shadow-lg hover:-translate-y-0.5
      transition-all duration-300 will-change-transform
      ring-1 ring-black/5 dark:ring-white/5
      ${className}
    `}
  >
    {(title || subtitle || rightNode) && (
      <div
        className="
          p-6 border-b border-border/60
          flex items-start justify-between gap-3
        "
      >
        <div>
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {rightNode}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default InfoCard;
