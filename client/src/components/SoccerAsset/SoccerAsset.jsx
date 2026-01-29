import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ASSETS, QUERY_ME } from "../../utils/queries";
import { CREATE_ASSET, UPDATE_ASSET, DELETE_ASSET } from "../../utils/mutations";

const SoccerAsset = () => {
  // Get current user and organization
  const { data: meData } = useQuery(QUERY_ME);
  const user = meData?.me;
  const currentOrganization = user?.currentOrganization;
  const organizationId = currentOrganization?._id;

  // State management
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    category: "Other",
    condition: "Good",
    notes: "",
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState("");

  // Check if user is admin or owner
  const isAdmin =
    user && currentOrganization &&
    (currentOrganization.owner?._id === user._id ||
      currentOrganization.admins?.some((admin) => admin._id === user._id));

  // Query assets
  const { loading, data, refetch } = useQuery(QUERY_ASSETS, {
    variables: { organizationId },
    skip: !organizationId,
    fetchPolicy: "network-only",
  });

  // Mutations
  const [createAsset] = useMutation(CREATE_ASSET, {
    onCompleted: () => {
      setShowSuccessMessage("Asset created successfully!");
      setShowModal(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      setShowErrorMessage(error.message || "Failed to create asset");
    },
  });

  const [updateAsset] = useMutation(UPDATE_ASSET, {
    onCompleted: () => {
      setShowSuccessMessage("Asset updated successfully!");
      setShowModal(false);
      setEditingAsset(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      setShowErrorMessage(error.message || "Failed to update asset");
    },
  });

  const [deleteAsset] = useMutation(DELETE_ASSET, {
    onCompleted: () => {
      setShowSuccessMessage("Asset deleted successfully!");
      refetch();
    },
    onError: (error) => {
      setShowErrorMessage(error.message || "Failed to delete asset");
    },
  });

  // Auto-hide success/error messages
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    if (showErrorMessage) {
      const timer = setTimeout(() => setShowErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorMessage]);

  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 0,
      category: "Other",
      condition: "Good",
      notes: "",
    });
  };

  const handleOpenModal = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name,
        quantity: asset.quantity,
        category: asset.category.replace(/_/g, " "),
        condition: asset.condition.replace(/_/g, " "),
        notes: asset.notes || "",
      });
    } else {
      setEditingAsset(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAsset(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setShowErrorMessage("Asset name is required");
      return;
    }

    if (formData.quantity < 0) {
      setShowErrorMessage("Quantity cannot be negative");
      return;
    }

    const input = {
      name: formData.name.trim(),
      quantity: parseInt(formData.quantity),
      category: formData.category.replace(/ /g, "_"),
      condition: formData.condition.replace(/ /g, "_"),
      notes: formData.notes.trim(),
    };

    try {
      if (editingAsset) {
        await updateAsset({
          variables: {
            assetId: editingAsset._id,
            input,
            organizationId,
          },
        });
      } else {
        await createAsset({
          variables: {
            input,
            organizationId,
          },
        });
      }
    } catch (error) {
      console.error("Error saving asset:", error);
    }
  };

  const handleDelete = async (assetId) => {
    setAssetToDelete(assetId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      await deleteAsset({
        variables: {
          assetId: assetToDelete,
          organizationId,
        },
      });
      setShowDeleteModal(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error("Error deleting asset:", error);
      setShowDeleteModal(false);
      setAssetToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAssetToDelete(null);
  };

  // Filter and search assets
  const assets = data?.assets || [];
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = filterCategory === "all" || asset.category === filterCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group assets by category
  const groupedAssets = filteredAssets.reduce((acc, asset) => {
    const category = asset.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(asset);
    return acc;
  }, {});

  const categories = ["Balls", "Training_Equipment", "Goals", "Jerseys", "Other"];
  const conditions = ["Excellent", "Good", "Fair", "Poor", "Needs_Replacement"];

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Balls":
        return "⚽";
      case "Training_Equipment":
        return "🏋️";
      case "Goals":
        return "🥅";
      case "Jerseys":
        return "👕";
      default:
        return "📦";
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "Excellent":
        return "text-green-600 bg-green-100";
      case "Good":
        return "text-blue-600 bg-blue-100";
      case "Fair":
        return "text-yellow-600 bg-yellow-100";
      case "Poor":
        return "text-orange-600 bg-orange-100";
      case "Needs_Replacement":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-24 md:pt-20 lg:pt-24 relative z-10">
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded relative z-10">
          {showSuccessMessage}
        </div>
      )}
      {showErrorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative z-10">
          {showErrorMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Team Equipment</h1>
          <p className="text-gray-600 dark:text-white mt-1">
            Manage your soccer team's equipment and assets
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200 flex items-center gap-2 cursor-pointer relative z-20"
          >
            <span >➕</span>
            Add Equipment
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border dark:bg-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Display */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg relative z-10">
          <p className="text-gray-500 text-lg">
            {assets.length === 0
              ? "No equipment added yet. Start by adding your first item!"
              : "No equipment matches your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 ">
          {Object.entries(groupedAssets).map(([, categoryAssets]) =>
            categoryAssets.map((asset) => (
              <div
                key={asset._id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden relative z-10"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">
                        {getCategoryIcon(asset.category)}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {asset.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {asset.category.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        {asset.quantity}
                      </p>
                      <p className="text-xs text-gray-500">items</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getConditionColor(
                        asset.condition
                      )}`}
                    >
                      {asset.condition.replace(/_/g, " ")}
                    </span>
                  </div>

                  {asset.notes && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {asset.notes}
                    </p>
                  )}

                  <div className="text-xs text-gray-400 mb-4">
                    Added by {asset.createdBy.name} on{" "}
                    {new Date(parseInt(asset.createdAt)).toLocaleDateString()}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 relative z-20">
                      <button
                        onClick={() => handleOpenModal(asset)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(asset._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ position: 'fixed', zIndex: 99999 }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
            style={{ position: 'absolute', zIndex: 99998 }}
          />
          
          {/* Modal Content */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-[100000]" style={{ position: 'relative', zIndex: 100000 }}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {editingAsset ? "Edit Equipment" : "Add New Equipment"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 dark:bg-gray-500 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Soccer Ball"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full px-4 dark:bg-gray-500 dark:text-white py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 dark:bg-gray-500 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat.replace(/_/g, " ")}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    className="w-full px-4 py-2 dark:bg-gray-500 dark:text-white border  border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {conditions.map((cond) => (
                      <option key={cond} value={cond.replace(/_/g, " ")}>
                        {cond.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border dark:bg-gray-500 dark:text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                    placeholder="Additional notes about this equipment..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
                  >
                    {editingAsset ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ position: 'fixed', zIndex: 99999 }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
            style={{ position: 'absolute', zIndex: 99998 }}
          />
          
          {/* Modal Content */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full relative z-[100000]" style={{ position: 'relative', zIndex: 100000 }}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete Equipment
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Are you sure you want to delete this equipment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SoccerAsset;
