import React from 'react';
interface HeaderProps {
  toggleSidebar: () => void;
}
const Header: React.FC<HeaderProps>  = ({ toggleSidebar }) => {
  return (
    <header className="col-span-full md:col-start-2 bg-white shadow-md p-4 flex items-center justify-between">
      <button className="btn btn-sm md:hidden flex" onClick={toggleSidebar}>
        <img
          src="/images/icons/hamburger.svg"
          alt="hamburger"
          width={25}
          height={25}
        />
      </button>
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div>
        <button className="btn-primary text-white px-4 py-2 rounded-md hover:btn-secondary">
          Profile
        </button>
      </div>
    </header>
  );
};

export default Header;
