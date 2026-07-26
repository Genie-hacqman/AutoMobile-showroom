// Brand metadata with logo paths
export const brandLogos = {
  'BMW': '/icons/%20BMW.png',
  'Changan': '/icons/changan.png',
  'Dodge': '/icons/dodge.png',
  'Ford': '/icons/ford.png',
  'Hyundai': '/icons/hyundai.png',
  'Jetour': '/icons/Jetour.png',
  'Lamborghini': '/icons/Lamborghini.png',
  'Mercedes-Benz': '/icons/mercedes.png',
  'Toyota': '/icons/Toyota.png',
};

export function getBrandLogo(brandName) {
  return brandLogos[brandName] || null;
}
