import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.scss";

function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand">
        InteliScrap
      </NavLink>
      <div className="navbar__links">
        {token ? (
          <button className="navbar__btn navbar__btn--outline" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `navbar__link${isActive ? " navbar__link--active" : ""}`
              }
            >
              Login
            </NavLink>
            <NavLink to="/register" className="navbar__btn navbar__btn--primary">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
