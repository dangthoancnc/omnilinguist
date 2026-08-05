import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, BookA, Search, Menu } from 'lucide-react';
import '../index.css';

const BottomNav = ({ onOpenMore }) => {
  const location = useLocation();

  const NAV_ITEMS = [
    { label: 'Home', path: '/', icon: <Home size={22} /> },
    { label: 'Learn', path: '/flashcards', icon: <BookA size={22} /> },
    { label: 'Read', path: '/reading', icon: <BookOpen size={22} /> },
    { label: 'Dict', path: '/dictionary', icon: <Search size={22} /> },
  ];

  return (
    <div className="bottom-nav hide-on-desktop">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
      
      {/* Nút More mở Sidebar */}
      <button className="bottom-nav-item more-btn" onClick={onOpenMore}>
        <Menu size={22} />
        <span className="bottom-nav-label">More</span>
      </button>
    </div>
  );
};

export default BottomNav;
