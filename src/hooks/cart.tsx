import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prods = await AsyncStorage.getItem('@GoMarketplace:products');
      prods !== null && setProducts(JSON.parse(prods));
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productAlreadyInCart = products.some(
        item => item.id === product.id,
      );

      if (!productAlreadyInCart) {
        product.quantity = 1;
        setProducts([...products, product]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);

      products[index].quantity++;
      setProducts([...products]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);

      if (products[index].quantity === 1) {
        const prods = products.filter(item => item.id !== id);
        setProducts([...prods]);
      } else {
        products[index].quantity--;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
