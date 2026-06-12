import { NavLink } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Tableau", icon: "M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" },
  { path: "/patients", label: "Patients", icon: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9a7 7 0 0 1 14 0Z" },
  { path: "/rendezvous", label: "Rendez-vous", icon: "M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" },
  { path: "/consultations", label: "Consultations", icon: "M12 3v18M3 12h18M5 5h14v14H5Z" },
  { path: "/prescriptions", label: "Prescriptions", icon: "M10 21 21 10a5 5 0 0 0-7-7L3 14a5 5 0 0 0 7 7Z" },
  { path: "/analyse", label: "Analyse IA", icon: "M12 2a4 4 0 0 1 4 4v1h1a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4h-1v1a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4v-1H6a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4h1V6a4 4 0 0 1 4-4h1Z" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-icon">
            <span>M</span>
          </div>

          <div>
            <h2>MedSync</h2>
            <p>Clinical Intelligence</p>
          </div>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === "/"}>
              <svg viewBox="0 0 24 24" className="menu-icon">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-profile">
        <div className="avatar">SB</div>
        <div>
          <strong>Dr. Sarah Benali</strong>
          <span>Médecin généraliste</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;