import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InfoCard from './InfoCard';
import { FileText, Terminal, ExternalLink } from 'lucide-react';
import LogsModal from './LogsModal';
import ConsoleModal from './ConsoleModal';

const ActionButton = ({ icon: Icon, label, onClick, href, isPrimary = false }) => {
  const commonClasses = `flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors hover:shadow-md`;
  const primaryClasses = `bg-primary text-primary-foreground hover:brightness-110`;
  const secondaryClasses = `bg-muted text-foreground hover:bg-muted/80`;
  
  const Component = href ? Link : 'button';
  const props = href ? { to: href } : { onClick };

  return (
    <Component className={`${commonClasses} ${isPrimary ? primaryClasses : secondaryClasses}`} {...props}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Component>
  );
};

const QuickActionsCard = ({ service }) => {
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isConsoleModalOpen, setIsConsoleModalOpen] = useState(false);

  return (
    <>
      <InfoCard title="Acciones rápidas">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <ActionButton icon={FileText} label="Ver Logs" onClick={() => setIsLogsModalOpen(true)} />
          <ActionButton icon={Terminal} label="Consola" onClick={() => setIsConsoleModalOpen(true)} />
          <ActionButton icon={ExternalLink} label="Acceder al Panel" href="#" isPrimary />
        </div>
      </InfoCard>
      {isLogsModalOpen && <LogsModal onClose={() => setIsLogsModalOpen(false)} />}
      {isConsoleModalOpen && <ConsoleModal onClose={() => setIsConsoleModalOpen(false)} />}
    </>
  );
};

export default QuickActionsCard;
