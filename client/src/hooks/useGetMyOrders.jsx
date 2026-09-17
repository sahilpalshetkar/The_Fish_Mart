import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/orderSlice";

const useGetOwnerOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      return;
    }
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/owner-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data.orders));
        console.log(result.data.orders);
      } catch (error) {
        if (error.response?.status !== 403) {
          console.error("Get owner orders error:", error);
        }
      }
    };
    fetchOrders();
  }, [userData]);
};

export default useGetOwnerOrders;
