import { useEffect, useState, useCallback } from "react";
import {
  getBranchesByFranchise,
  createBranch,
  updateBranch,
  deleteBranch,
  resetInviteCode
} from "../../services/branchService";

import {
  FiPlus,
  FiMapPin,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiEdit3,
  FiRefreshCw,
  FiMoreVertical,
  FiTrash2,
  FiRefreshCcw,
  FiX
} from "react-icons/fi";

import "./OwnerAddOns.css";

const BranchManagement = () => {

  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  /* ⭐ MODAL STATE */
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    branch_name: "",
    location: "",
    manager_email: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  /* ================= FETCH ================= */

  const fetchBranches = useCallback(async () => {
    if (!franchiseId) return;
    setLoading(true);
    try {
      const res = await getBranchesByFranchise(franchiseId);
      setBranches(res.data || []);
      setFilteredBranches(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [franchiseId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  /* ================= SEARCH ================= */

  useEffect(() => {
    const filtered = branches.filter(b =>
      b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.manager_email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  /* ================= CLOSE MENU ================= */

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  /* ================= ACTIONS ================= */

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Delete this branch?")) return;
    await deleteBranch(id);
    fetchBranches();
  };

  const handleResetInvite = async (id) => {
    if (!window.confirm("Reset invite code?")) return;
    await resetInviteCode(id);
    fetchBranches();
  };

  /* ⭐ CREATE BRANCH */
  const handleCreateBranch = async () => {
    try {
      await createBranch({
        ...formData,
        franchise_id: franchiseId
      });

      setShowModal(false);
      setFormData({
        branch_name: "",
        location: "",
        manager_email: ""
      });

      fetchBranches();
    } catch (err) {
      alert("Failed to create branch");
      console.log(err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="addon-page">

      <div className="addon-header">
        <h1>🏢 Branch Management</h1>
        <button className="addon-btn" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Branch
        </button>
      </div>

      <div className="addon-controls">
        <div className="search-wrapper">
          <FiSearch />
          <input
            className="addon-input"
            placeholder="Search branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-secondary" onClick={fetchBranches}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="branches-grid">

        {loading ? (
          <p>Loading...</p>
        ) : filteredBranches.map(b => (

          <div key={b.branch_id} className="branch-card glass-card">

            <div className="branch-card-header">
              <h3>{b.branch_name}</h3>
              <span className={`status-badge ${b.status === "ACTIVE" ? "status-active" : "status-inactive"}`}>
                {b.status}
              </span>
            </div>

            <div className="branch-info-row">
              <FiMapPin /> {b.location}
            </div>

            <div className="branch-info-row">
              <FiMail /> {b.manager_email || "No manager"}
            </div>

            <div className="branch-info-row">
              {b.manager_id ?
                <><FiCheckCircle color="#10b981" /> Active Manager</>
                :
                <><FiClock color="#f59e0b" /> Pending Registration</>
              }
            </div>

            <div className="branch-actions">

              <div className="branch-options">
                <button
                  className="action-btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(prev =>
                      prev === b.branch_id ? null : b.branch_id
                    );
                  }}
                >
                  <FiMoreVertical />
                </button>

                {activeMenu === b.branch_id && (
                  <div className="options-dropdown">
                    {!b.manager_id &&
                      <button onClick={() => handleResetInvite(b.branch_id)}>
                        <FiRefreshCcw /> Reset Invite
                      </button>
                    }

                    <button
                      className="delete-option"
                      onClick={() => handleDeleteBranch(b.branch_id)}
                    >
                      <FiTrash2 /> Delete Branch
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* ⭐⭐⭐ ADD BRANCH MODAL ⭐⭐⭐ */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">

            <div style={{display:"flex",justifyContent:"space-between"}}>
              <h2 className="modal-title">Add Branch</h2>
              <FiX
                style={{cursor:"pointer"}}
                onClick={() => setShowModal(false)}
              />
            </div>

            <div className="form-group">
              <label>Branch Name</label>
              <input
                className="modal-input"
                value={formData.branch_name}
                onChange={(e)=>setFormData({...formData,branch_name:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                className="modal-input"
                value={formData.location}
                onChange={(e)=>setFormData({...formData,location:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Manager Email</label>
              <input
                className="modal-input"
                value={formData.manager_email}
                onChange={(e)=>setFormData({...formData,manager_email:e.target.value})}
              />
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={()=>setShowModal(false)}>
                Cancel
              </button>

              <button className="addon-btn" onClick={handleCreateBranch}>
                Create Branch
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BranchManagement;