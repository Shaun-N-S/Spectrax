import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null); // Simulate user state
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleUserAction = (path) => {
    setIsUserDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    // Simulate logout logic
    localStorage.removeItem('accesstoken');
    navigate("/");
    setUser(null);
    setIsUserDropdownOpen(false);
    console.log("User logged out");
    
  };
  
  const toggleDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-black text-white relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tighter">
            SPECTRAX
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-gray-300 transition-colors">
              HOME
            </Link>
            <Link to="/best-sellers" className="text-sm font-medium hover:text-gray-300 transition-colors">
              BEST SELLERS
            </Link>
            <Link to="/shop" className="text-sm font-medium hover:text-gray-300 transition-colors">
              SHOP
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-gray-300 transition-colors">
              CONTACT
            </Link>
          </nav>

          {/* Search and Icons */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] lg:w-[300px] bg-white text-black pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-black hover:text-gray-600">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-white">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleDropdown}>
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
                    <ul>
                      {user ? (
                        <>
                          <li>
                            <Link to="/account" className="block px-4 py-2 hover:bg-gray-200" onClick={() => handleUserAction("/account")}>
                              Account
                            </Link>
                          </li>
                          <li>
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={handleLogout}>
                              Logout
                            </button>
                          </li>
                        </>
                      ) : (
                        <li>
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={() => handleUserAction("/login")}>
                            Login
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
