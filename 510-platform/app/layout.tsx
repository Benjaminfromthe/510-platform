import React from 'react';
import './globals.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="bg-navy text-white">
        <header>
          <nav className="flex justify-between items-center p-4 bg-navy">
            <div className="text-2xl font-bold">510</div>
            <div className="space-x-4">
              <a href="#services" className="hover:text-blue">Services</a>
              <a href="#book-now" className="hover:text-blue">Book Now</a>
              <a href="#about" className="hover:text-blue">About</a>
              <button className="bg-blue text-white px-4 py-2 rounded">Login</button>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="p-4 text-center bg-navy">
          © 2023 510 Platform. All rights reserved.
        </footer>
      </body>
    </html>
  );
};

export default Layout;