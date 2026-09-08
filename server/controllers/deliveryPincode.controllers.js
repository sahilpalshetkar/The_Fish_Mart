import DeliveryPincode from "../models/DeliveryPincode.js";

export const checkPincode = async (req, res) => {
  try {
    const pincode = req.params.pincode?.trim();

    // Validate pincode
    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required",
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit pincode",
      });
    }

    // Check delivery area
    const deliveryArea = await DeliveryPincode.findOne({
      pincode,
      isActive: true,
    });

    // Not deliverable
    if (!deliveryArea) {
      return res.status(200).json({
        success: true,
        serviceable: false,
        message: "Sorry, we currently don't deliver to this address.",
      });
    }

    // Deliverable
    return res.status(200).json({
      success: true,
      serviceable: true,
      message: "Great! We deliver to this address.",
      deliveryFee: deliveryArea.deliveryFee,
      estimatedDelivery: deliveryArea.estimatedDelivery,
    });
  } catch (error) {
    console.error("Check pincode error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check delivery availability",
    });
  }
};
