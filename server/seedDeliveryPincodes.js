import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryPincode from "./models/DeliveryPincode.js";

dotenv.config();

const deliveryPincodes = [
  // MUMBAI
  {
    pincode: "400001",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400002",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400003",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400004",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400005",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400006",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400007",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400008",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400009",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400010",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400011",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400012",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400013",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400014",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400015",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400016",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400017",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400018",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400019",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400020",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400021",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400022",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400023",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400024",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400025",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400026",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400027",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400028",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400029",
    city: "Mumbai",
    zone: "Western Suburbs",
  },
  {
    pincode: "400030",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400031",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400032",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400033",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400034",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400035",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400036",
    city: "Mumbai",
    zone: "South Mumbai",
  },
  {
    pincode: "400037",
    city: "Mumbai",
    zone: "Central Mumbai",
  },
  {
    pincode: "400038",
    city: "Mumbai",
    zone: "South Mumbai",
  },

  // MUMBAI SUBURBS
  {
    pincode: "400042",
    city: "Mumbai",
    zone: "Bhandup",
  },
  {
    pincode: "400043",
    city: "Mumbai",
    zone: "Govandi",
  },
  {
    pincode: "400049",
    city: "Mumbai",
    zone: "Juhu",
  },
  {
    pincode: "400050",
    city: "Mumbai",
    zone: "Bandra",
  },
  {
    pincode: "400051",
    city: "Mumbai",
    zone: "Bandra",
  },
  {
    pincode: "400052",
    city: "Mumbai",
    zone: "Bandra",
  },
  {
    pincode: "400053",
    city: "Mumbai",
    zone: "Andheri",
  },
  {
    pincode: "400054",
    city: "Mumbai",
    zone: "Santacruz",
  },
  {
    pincode: "400055",
    city: "Mumbai",
    zone: "Santacruz",
  },
  {
    pincode: "400056",
    city: "Mumbai",
    zone: "Vile Parle",
  },
  {
    pincode: "400057",
    city: "Mumbai",
    zone: "Vile Parle",
  },
  {
    pincode: "400058",
    city: "Mumbai",
    zone: "Andheri",
  },
  {
    pincode: "400059",
    city: "Mumbai",
    zone: "Andheri",
  },
  {
    pincode: "400060",
    city: "Mumbai",
    zone: "Jogeshwari",
  },
  {
    pincode: "400061",
    city: "Mumbai",
    zone: "Andheri",
  },
  {
    pincode: "400063",
    city: "Mumbai",
    zone: "Goregaon",
  },
  {
    pincode: "400064",
    city: "Mumbai",
    zone: "Malad",
  },
  {
    pincode: "400065",
    city: "Mumbai",
    zone: "Aarey",
  },
  {
    pincode: "400066",
    city: "Mumbai",
    zone: "Borivali",
  },
  {
    pincode: "400067",
    city: "Mumbai",
    zone: "Kandivali",
  },
  {
    pincode: "400068",
    city: "Mumbai",
    zone: "Dahisar",
  },
  {
    pincode: "400069",
    city: "Mumbai",
    zone: "Andheri East",
  },
  {
    pincode: "400070",
    city: "Mumbai",
    zone: "Kurla",
  },
  {
    pincode: "400071",
    city: "Mumbai",
    zone: "Chembur",
  },
  {
    pincode: "400072",
    city: "Mumbai",
    zone: "Saki Naka",
  },
  {
    pincode: "400074",
    city: "Mumbai",
    zone: "Chembur",
  },
  {
    pincode: "400075",
    city: "Mumbai",
    zone: "Ghatkopar",
  },
  {
    pincode: "400076",
    city: "Mumbai",
    zone: "Powai",
  },
  {
    pincode: "400077",
    city: "Mumbai",
    zone: "Ghatkopar",
  },
  {
    pincode: "400078",
    city: "Mumbai",
    zone: "Bhandup",
  },
  {
    pincode: "400079",
    city: "Mumbai",
    zone: "Vikhroli",
  },
  {
    pincode: "400080",
    city: "Mumbai",
    zone: "Mulund",
  },
  {
    pincode: "400081",
    city: "Mumbai",
    zone: "Mulund",
  },
  {
    pincode: "400082",
    city: "Mumbai",
    zone: "Mulund",
  },
  {
    pincode: "400083",
    city: "Mumbai",
    zone: "Vikhroli",
  },
  {
    pincode: "400084",
    city: "Mumbai",
    zone: "Ghatkopar",
  },
  {
    pincode: "400085",
    city: "Mumbai",
    zone: "Trombay",
  },
  {
    pincode: "400086",
    city: "Mumbai",
    zone: "Ghatkopar",
  },
  {
    pincode: "400087",
    city: "Mumbai",
    zone: "Ghatkopar",
  },
  {
    pincode: "400088",
    city: "Mumbai",
    zone: "Govandi",
  },
  {
    pincode: "400089",
    city: "Mumbai",
    zone: "Chembur",
  },
  {
    pincode: "400090",
    city: "Mumbai",
    zone: "Goregaon",
  },
  {
    pincode: "400091",
    city: "Mumbai",
    zone: "Borivali",
  },
  {
    pincode: "400092",
    city: "Mumbai",
    zone: "Borivali",
  },
  {
    pincode: "400093",
    city: "Mumbai",
    zone: "Andheri East",
  },
  {
    pincode: "400094",
    city: "Mumbai",
    zone: "Anushakti Nagar",
  },
  {
    pincode: "400095",
    city: "Mumbai",
    zone: "Malad",
  },
  {
    pincode: "400096",
    city: "Mumbai",
    zone: "Powai",
  },
  {
    pincode: "400097",
    city: "Mumbai",
    zone: "Malad",
  },
  {
    pincode: "400098",
    city: "Mumbai",
    zone: "Vile Parle",
  },
  {
    pincode: "400099",
    city: "Mumbai",
    zone: "Airport",
  },
  {
    pincode: "400101",
    city: "Mumbai",
    zone: "Kandivali",
  },
  {
    pincode: "400102",
    city: "Mumbai",
    zone: "Jogeshwari",
  },
  {
    pincode: "400103",
    city: "Mumbai",
    zone: "Borivali",
  },
  {
    pincode: "400104",
    city: "Mumbai",
    zone: "Goregaon",
  },

  // NAVI MUMBAI
  {
    pincode: "400614",
    city: "Navi Mumbai",
    zone: "CBD Belapur",
  },
  {
    pincode: "400701",
    city: "Navi Mumbai",
    zone: "Ghansoli",
  },
  {
    pincode: "400702",
    city: "Navi Mumbai",
    zone: "Kharghar",
  },
  {
    pincode: "400703",
    city: "Navi Mumbai",
    zone: "Vashi",
  },
  {
    pincode: "400705",
    city: "Navi Mumbai",
    zone: "Sanpada",
  },
  {
    pincode: "400706",
    city: "Navi Mumbai",
    zone: "Nerul",
  },
  {
    pincode: "400708",
    city: "Navi Mumbai",
    zone: "Airoli",
  },
  {
    pincode: "400709",
    city: "Navi Mumbai",
    zone: "Kopar Khairane",
  },
  {
    pincode: "400710",
    city: "Navi Mumbai",
    zone: "Mahape",
  },

  // Extended Navi Mumbai
  {
    pincode: "410206",
    city: "Navi Mumbai",
    zone: "Panvel",
  },
  {
    pincode: "410207",
    city: "Navi Mumbai",
    zone: "Panvel",
  },
  {
    pincode: "410208",
    city: "Navi Mumbai",
    zone: "Panvel",
  },
  {
    pincode: "410209",
    city: "Navi Mumbai",
    zone: "Panvel",
  },
  {
    pincode: "410210",
    city: "Navi Mumbai",
    zone: "Kharghar",
  },
  {
    pincode: "410218",
    city: "Navi Mumbai",
    zone: "Taloja",
  },

  // THANE
  {
    pincode: "400601",
    city: "Thane",
    zone: "Thane West",
  },
  {
    pincode: "400602",
    city: "Thane",
    zone: "Naupada",
  },
  {
    pincode: "400603",
    city: "Thane",
    zone: "Thane East",
  },
  {
    pincode: "400604",
    city: "Thane",
    zone: "Wagle Estate",
  },
  {
    pincode: "400605",
    city: "Thane",
    zone: "Kalwa",
  },
  {
    pincode: "400606",
    city: "Thane",
    zone: "Thane",
  },
  {
    pincode: "400607",
    city: "Thane",
    zone: "Manpada",
  },
  {
    pincode: "400608",
    city: "Thane",
    zone: "Balkum",
  },
  {
    pincode: "400609",
    city: "Thane",
    zone: "Thane",
  },
  {
    pincode: "400610",
    city: "Thane",
    zone: "Thane",
  },
  {
    pincode: "400612",
    city: "Thane",
    zone: "Mumbra",
  },
];

// REMOVE DUPLICATES

const uniquePincodes = Array.from(
  new Map(deliveryPincodes.map((item) => [item.pincode, item])).values(),
);

// ADD DEFAULT DELIVERY SETTINGS
const finalPincodes = uniquePincodes.map((item) => ({
  ...item,
  isActive: true,
  deliveryFee: 49,
  estimatedDelivery: "Same Day",
}));

// SEED DATABASE

const seedDeliveryPincodes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await DeliveryPincode.deleteMany({});
    await DeliveryPincode.insertMany(finalPincodes);
    console.log(
      `✅ ${finalPincodes.length} delivery pincodes added successfully`,
    );

    console.log(
      `Mumbai: ${
        finalPincodes.filter((item) => item.city === "Mumbai").length
      }`,
    );

    console.log(
      `Navi Mumbai: ${
        finalPincodes.filter((item) => item.city === "Navi Mumbai").length
      }`,
    );

    console.log(
      `Thane: ${finalPincodes.filter((item) => item.city === "Thane").length}`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedDeliveryPincodes();
