import React, { useEffect, useState } from "react";
import axios from "axios";
import { getBaseURL } from "../apiConfig";
import ShoppingCart from "../ShopingCart/ShoppingCart";

const ProductListCustomer = (props) => {
  const [productList, setProductList] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);
  const customerId = sessionStorage.getItem("customerId"); // This is the buyer_user_id
  const [address, setAddress] = useState("");

  // --- 1. FIXED useEffect ---
  // No longer nested. Just get products and show them.
  useEffect(() => {
    axios
      .get(`${getBaseURL()}api/products`) // Correct, working URL
      .then((res) => {
        const productsWithQuantity = res.data.map((product) => ({
          ...product,
          quantity: 0, // Initialize quantity input
        }));
        setProductList(productsWithQuantity); // <-- This will now work
      })
      .catch((err) => console.log("Error fetching products:", err));
  }, []);

  // --- 2. FIXED addToCart ---
  // This no longer calls an API. It just updates the cart state.
  const addToCart = (productToAdd) => {
    if (productToAdd.quantity > 0) {
      let updatedCartList = [...cartProducts];
      
      // FIX: Use the correct product ID key from our schema
      let existingProductIndex = updatedCartList.findIndex(
        (p) => p.product_id === productToAdd.product_id
      );

      if (existingProductIndex !== -1) {
        // Product exists, just add to its quantity
        updatedCartList[existingProductIndex].quantity += productToAdd.quantity;
      } else {
        // Product not in cart, add it
        // FIX: Use the correct keys (product_id, product_name)
        updatedCartList.push({
          product_id: productToAdd.product_id,
          product_name: productToAdd.product_name,
          price: productToAdd.price,
          quantity: productToAdd.quantity,
        });
      }

      // No API call needed here, just update the state
      setCartProducts(updatedCartList);

      // Reset the quantity inputs in the product list
      const updatedProductList = productList.map((p) => ({
        ...p,
        quantity: 0,
      }));
      setProductList(updatedProductList);
    }
  };

  // --- 3. FIXED removeProduct ---
  // This also no longer calls an API.
  const removeProduct = (productIdToRemove) => {
    let updatedCartList = cartProducts.filter((product) => {
      return product.product_id !== productIdToRemove;
    });
    setCartProducts(updatedCartList);
  };

  // This function is fine, just updates the input field
  const updateProductQuantity = (e, productId) => {
    const updatedList = productList.map((product) => {
      // FIX: Use correct key 'product_id'
      if (product.product_id === productId) {
        product.quantity = parseInt(e.target.value) || 0;
      }
      return product;
    });
    setProductList(updatedList);
  };

  // --- 4. FIXED buyProducts (THE BIG ONE) ---
  // This now points to our *working* /api/orders endpoint
  const buyProducts = () => {
    const token = sessionStorage.getItem('jwt_token');

    if (!token) {
      alert("Authorization token is missing. Please log in again.");
      return;
    }
    if (address.trim() === "") {
      alert("Please enter your shipping address");
      return;
    }
    if (cartProducts.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // 1. Calculate the total_amount
    const total_amount = cartProducts.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 2. Format the 'items' array for our backend
    const items = cartProducts.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_ordertime: item.price // Using the current price
    }));

    // 3. Build the *correct* payload for POST /api/orders
    const orderPayload = {
      buyer_user_id: parseInt(customerId), // From session storage
      total_amount: total_amount.toFixed(2),
      shipping_address: address,
      phone_number: "9876543210", // Sending a dummy phone for now
      items: items,
    };

    // 4. Set up headers with our login token
    const config = {
      headers: {
        Authorization: `Bearer ${token}` // This isn't required by our order route, but it's good practice
      }
    };

    // 5. Call the *correct* API endpoint
    axios
      .post(`${getBaseURL()}/api/orders`, orderPayload, config)
      .then((res) => {
        // Order was successful!
        setCartProducts([]); // Clear the cart
        setAddress(""); // Clear the address
        alert(`Order placed successfully! Your Order ID is: ${res.data.orderId}`);
      })
      .catch(error => {
        // Handle errors (e.g., "Out of stock")
        const message = error.response?.data?.message || "Error placing order.";
        console.error("Order Error:", error);
        alert(`Error placing order: ${message}`);
      });
  };


  const updateAddress = (updatedAddress) => {
    setAddress(updatedAddress);
  };

  // --- 5. FIXED JSX ---
  // Updated to use the correct product keys from our database
  return (
    <>
      <div className="product-list-container">
        <div>
          <h1>Products</h1>
        </div>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Price</th>
              <th>No. of Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product) => {
              return (
                <tr key={product.product_id}>
                  <td>{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>{product.price}</td>
                  <td>
                    <input
                      type="number"
                      value={product.quantity}
                      min="0"
                      placeholder="Quantity"
                      onChange={(e) =>
                        updateProductQuantity(e, product.product_id)
                      }
                    ></input>
                  </td>
                  <td>
                    <button
                        onClick={() => {
                          addToCart(product);
                        }}
                      >
                        Add to Cart
                     </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ShoppingCart
        cartProducts={cartProducts}
        removeProduct={removeProduct}
        buyProducts={buyProducts}
        address={address} // FIX: Was 'props.address'
        updateAddress={updateAddress}
      />
    </>
  );
};

export default ProductListCustomer;