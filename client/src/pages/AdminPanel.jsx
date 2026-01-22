import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import AdminPanelComponent from "../components/AdminPanel";
import Auth from "../utils/auth";

const AdminPanel = () => {
  const navigate = useNavigate();
  
  const { loading, data } = useQuery(QUERY_ME, {
    fetchPolicy: 'network-only',
  });

  const currentUser = data?.me || {};
  const organization = currentUser.currentOrganization || {};
  const isAdmin = organization.owner?._id === currentUser._id;

  // Redirect if not logged in
  if (!Auth.loggedIn()) {
    return (
      <div className="text-center mt-4">
        <h4 className="text-lg text-gray-700 dark:text-gray-300">
          You need to be logged in to access the admin panel.
        </h4>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <div className="text-center mt-4">Loading admin panel...</div>;
  }

  // Redirect if not admin
  if (!loading && !isAdmin) {
    navigate("/dashboard");
    return null;
  }

  return (
    <main className="mx-auto ml-2 w-full px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:max-w-7xl overflow-hidden">
      <AdminPanelComponent />
    </main>
  );
};

export default AdminPanel;
