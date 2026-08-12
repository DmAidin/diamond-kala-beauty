// Maps known category names to the real photography the store owner
// supplied. Backgrounds were keyed out to transparency and tight-cropped
// (see /public/category-*.png) so they sit directly on the page instead
// of inside a white box. Any category not listed here still works — it
// just falls back to a plain initial-letter badge instead of a photo.
export const CATEGORY_IMAGES = {
  "مراقبت پوست": { src: "/category-skincare.png", width: 283, height: 321 },
  "بهداشت شخصی": { src: "/category-hygiene.png", width: 281, height: 321 },
  "عطر و ادکلن": { src: "/category-perfume.png", width: 288, height: 323 },
  "آرایش": { src: "/category-makeup.png", width: 282, height: 323 },
  "مراقبت مو": { src: "/category-haircare.png", width: 281, height: 321 },
};
