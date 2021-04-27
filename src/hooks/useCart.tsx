import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

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
	const [cart, setCart] = useState<Product[]>([]);

	useEffect(() => {
		const storagedCart = localStorage.getItem("@RocketShoes:cart");
		if (storagedCart) {
			setCart(JSON.parse(storagedCart) as Product[]);
		}
	}, []);

	const addProduct = async (productId: number) => {
		try {
			const updatedCart = [...cart];

			let productExists = updatedCart.find(
				(product) => product.id === productId
			);

			const responseStock = await api.get(`/stock/${productId}`);
			const stock = responseStock.data;

			if (productExists) {
				if (stock.amount - productExists.amount <= 0) {
					toast.error("Quantidade solicitada fora de estoque");
					return;
				}

				productExists.amount = productExists.amount + 1;
			} else {
				if (stock.amount <= 0) {
					toast.error("Quantidade solicitada fora de estoque");
					return;
				}

				const product = await api.get("products/" + String(productId));

				const newProduct = {
					...product.data,
					amount: 1,
				};
				updatedCart.push(newProduct);
			}

			setCart(updatedCart);
			localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
		} catch {
			toast.error("Erro na adição do produto");
		}
	};

	const removeProduct = (productId: number) => {
		try {
			const productExists = cart.find((product) => product.id === productId);

			if (!productExists) {
				throw new Error("");
			}
			const updatedCart = cart.filter((product) => product.id !== productId);

			setCart(updatedCart);

			localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
		} catch {
			toast.error("Erro na remoção do produto");
		}
	};

	const updateProductAmount = async ({
		productId,
		amount,
	}: UpdateProductAmount) => {
		try {
			if (amount === 0) {
				return;
			}

			const responseStock = await api.get(`stock/${productId}`);
			const stock = responseStock.data;

			if (stock.amount <= amount) {
				toast.error("Quantidade solicitada fora de estoque");
				return;
			}

			const updatedCart = [...cart];
			const product = updatedCart.find((product) => product.id === productId);

			if (product) {
				product.amount = amount;
			}

			setCart(updatedCart);

			localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
		} catch {
			toast.error("Erro na alteração de quantidade do produto");
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
