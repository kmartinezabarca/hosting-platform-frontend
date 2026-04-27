// src/components/dashboard/ActionRow.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ActionRow = ({ icon: Icon, title, description, to, colorClass = 'text-primary' }) => {
  return (
    <Link to={to} className="block w-full">
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="
          group flex w-full items-center space-x-4 rounded-2xl 
          bg-muted/50 p-4 transition-colors duration-200 
          hover:bg-muted
        "
      >
        {/* Contenedor del Ícono */}
        <div 
          className={`
            flex h-12 w-12 flex-shrink-0 items-center justify-center 
            rounded-xl bg-background transition-colors duration-200 
            group-hover:bg-primary/10
          `}
        >
          <Icon className={`h-6 w-6 text-muted-foreground transition-colors duration-200 group-hover:${colorClass}`} />
        </div>
        
        {/* Contenedor del Texto */}
        <div className="flex-grow">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
};

export default ActionRow;