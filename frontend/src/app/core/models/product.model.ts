export interface Product {
  id: string;
  name: string;
  description: string;
  theme: string;
  price: number;
  imageUrl: string;
  ingredients: string[];
  nutritionalInfo: string;
  stock: number;
  availableToday: boolean;
}
