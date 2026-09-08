import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import { useSelector } from "react-redux";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import CreateEditShop from "./pages/CreateEditShop";
import useGetMyShop from "./hooks/useGetMyShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import ManageShop from "./pages/ManageShop";
import ManageItems from "./pages/ManageItems";
import ForgotPassword from "./pages/ForgotPassword";
import AllProducts from "./pages/AllProducts";
import Categories from "./pages/categories";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Cart from "./pages/Cart";
import { Toaster } from "react-hot-toast";
import Checkout from "./pages/Checkout";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import OwnerOrders from "./pages/OwnerOrders";

export const serverUrl = "http://localhost:9000";

const App = () => {
  const { userData } = useSelector((state) => state.user);

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/manage-shop"
          element={userData ? <ManageShop /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/manage-items"
          element={userData ? <ManageItems /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/categories"
          element={userData ? <Categories /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/all-products"
          element={userData ? <AllProducts /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/profile"
          element={userData ? <Profile /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/product/:itemId"
          element={userData ? <ProductDetails /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/about"
          element={userData ? <About /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/cart"
          element={userData ? <Cart /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/checkout"
          element={userData ? <Checkout /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/order/:orderId"
          element={userData ? <OrderDetails /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/owner-orders"
          element={userData ? <OwnerOrders /> : <Navigate to={"/signin"} />}
        />
      </Routes>
    </>
  );
};

export default App;
