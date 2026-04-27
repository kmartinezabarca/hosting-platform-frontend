import React from 'react';

const InfoRow = ({ label, children }) => (
  <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="text-sm font-medium text-foreground text-right">{children}</div>
  </div>
);

export default InfoRow;