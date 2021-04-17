import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
	children: ReactNode;
}

interface UpdateProductAmount {
	productId: number;
	amount: number;
}

interface CartContextData {
	cart: Product[];
	addProduct: (productId: number) => Promise<void>;
	removeProduct: (productId: number) => void;
	updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
	// const [cart, setCart] = useState<Product[]>(() => {
	// const storagedCart = Buscar dados do localStorage

	// if (storagedCart) {
	//   return JSON.parse(storagedCart);
	// }

	// 	return [];
	// });

	const [cart, setCart] = useState<Product[]>([]);

	useEffect(() => {
		if (localStorage.getItem("@RocketShoes:cart")) {
			const storagedCart = localStorage.getItem("@RocketShoes:cart");
			setCart(JSON.parse(storagedCart || "") as Product[]);
		}

		// const storagedCart = JSON.parse(
		// 	localStorage.getItem("@RocketShoes:cart")
		// ) as Product[];
		// setCart(storagedCart);
	}, []);

	const addProduct = async (productId: number) => {
		try {
			await api.get("products/" + String(productId)).then((response) => {
				let product = response.data;
				console.log(response.data);
				const amountProduct = cart
					.map((product) => product.id)
					.filter((value, index, array) => array.indexOf(value) === index)
					.length;

				const cartHasProduct = cart.find((product) => product.id === productId);
				console.log("amountProduct:" + amountProduct);
				console.log("hasProduct: " + cartHasProduct);

				if (cartHasProduct) {
					product = cartHasProduct;
					product.amount = amountProduct + 1;
				} else {
					product.amount = 1;
				}

				const indexCart = cart.findIndex((c) => c.id === cartHasProduct?.id);

				console.log("product:" + product);
				console.log("prduct.amount: " + product.amount);
				// console.log("xlll");
				// console.log(amountProduct);
				// product.amount = amountProduct + 1;
				setCart((oldCart) => {
					if (indexCart > -1) {
						return [...oldCart, cartHasProduct];
					} else {
						return [...oldCart, product];
					}
					// oldCart.findIndex()
					/*  TODO: Encontrar o indice, adicionar no carrinho nessa posição. 
						Na verdade, vai ser outra posição do array, mas não sei com irá 
						funcionar
					 */
				});
				console.log(cart);
				console.log(product);
			});
		} catch {
			toast.error("Ocorreu um problema ao localizar o produto");
		}
	};

	const removeProduct = (productId: number) => {
		try {
			// TODO
		} catch {
			// TODO
		}
	};

	const updateProductAmount = async ({
		productId,
		amount,
	}: UpdateProductAmount) => {
		try {
			// TODO
		} catch {
			// TODO
		}
	};

	return (
		<CartContext.Provider
			value={{ cart, addProduct, removeProduct, updateProductAmount }}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartContextData {
	const context = useContext(CartContext);

	return context;
}
