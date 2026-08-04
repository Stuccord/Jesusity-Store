import teeFront from "@/assets/IMG_8448.png";
import teeBack from "@/assets/tee back.jpeg";
import teeLifestyle from "@/assets/tee-front.jpeg";
import teePromo from "@/assets/IMG_8450.png";
import teeDetail from "@/assets/tee-lifestyle-new.jpeg";

export const PRODUCT = {
  id: "jesusity-tee-forest",
  name: "The Jesusity Tee",
  colorway: "Forest Green",
  // Display price in USD shown to customers (~$26 USD ≈ GH₵300)
  price: 26,
  currency: "USD",
  // Primary checkout currency on Paystack is Cedis (GH₵300)
  priceGHS: 300,
  currencyGHS: "GHS",
  sizes: ["S", "M", "L", "XL", "XXL"] as const,
  shipEstimate: "3 Working Days",
  preorderCloseISO: "2099-12-31T23:59:59-05:00",
  images: {
    front: teeFront,
    back: teeBack,
    lifestyle: teeLifestyle,
    promo: teePromo,
    detail: teeDetail,
  },
};

export type Size = (typeof PRODUCT.sizes)[number];
