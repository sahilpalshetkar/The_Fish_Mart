import React from "react";
import { useSelector } from "react-redux";
import AdminDashboard from "../components/AdminDashboard";
import DeliveryBoy from "../components/DeliveryBoy";
import CustomerDashboard from "../components/CustomerDashboard";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-[#fff9f6]">
      {userData.role == "customer" && <CustomerDashboard />}
      {userData.role == "admin" && <AdminDashboard />}
      {userData.role == "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
};

export default Home;
