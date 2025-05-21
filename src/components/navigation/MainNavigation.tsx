import { NavLink } from "react-router-dom";
import { BarChart } from "lucide-react";

export function MainNavigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <BarChart className="h-8 w-8 text-waymore-primary" />
              <span className="ml-2 text-xl font-bold text-waymore-dark">Waymore Funnels</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink
                to="/funnels"
                className={({ isActive }) =>
                  isActive
                    ? "border-waymore-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                }
              >
                Funnels
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
