import React from 'react';

const PageTransition = ({ children }) => {
  return (
    <div className="animate-page-enter">
      {children}
    </div>
  );
};

export default PageTransition;
