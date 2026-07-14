import teeFront from "@/assets/IMG_8448.png";
import teeBack from "@/assets/tee back.jpeg";
import teeLifestyle from "@/assets/tee-front.jpeg";
import teePromo from "@/assets/IMG_8450.png";
import teeDetail from "@/assets/tee-lifestyle-new.jpeg";


export const PRODUCT = {
  id: "jesusity-tee-forest",
  name: "The Jesusity Tee",
  colorway: "Forest Green",
  // Display price in USD shown to customers
  price: 22,
  currency: "USD",
  // Paystack charges in GHS — update this to match your desired Cedis price
  // (1 USD = 11.50 GHS -> $22 = 253 GHS)
  priceGHS: 253,
  currencyGHS: "GHS",
  sizes: ["S", "M", "L", "XL", "XXL"] as const,
  shipEstimate: "Ships August 2026",
  preorderCloseISO: "2026-07-27T23:59:59-05:00",
  images: {
    front: teeFront,
    back: teeBack,
    lifestyle: teeLifestyle,
    promo: teePromo,
    detail: teeDetail,
  },
};

export type Size = (typeof PRODUCT.sizes)[number];
