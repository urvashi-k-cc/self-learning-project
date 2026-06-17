import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useAuth();
  const isManager = user?.role === "manager";

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-700 bg-gray-800">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-3 sm:px-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-gray-200 hover:text-white" />

          {/* Desktop nav */}
          {/* <nav className="hidden md:flex items-center gap-4 ml-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">
              Dashboard
            </Link>

            {isManager && (
              <>
                <Link
                  to="/projects/create"
                  className="text-gray-300 hover:text-white"
                >
                  New Project
                </Link>
                <Link
                  to="/teams/create"  
                  className="text-gray-300 hover:text-white"
                >
                  New Team
                </Link>
              </>
            )}
          </nav> */}
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          {/* <button
            type="button"
            className="md:hidden rounded-md px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700 hover:text-white"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            Menu
          </button> */}
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-md p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaUserCircle size={24} />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-700 px-3 py-3 space-y-2">
          <Link
            to="/dashboard"
            className="block rounded-md px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>

          {isManager && (
            <>
              <Link
                to="/projects/create"
                className="block rounded-md px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Project
              </Link>

              <Link
                to="/teams/create"
                className="block rounded-md px-3 py-2 text-gray-200 hover:bg-gray-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Team
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
