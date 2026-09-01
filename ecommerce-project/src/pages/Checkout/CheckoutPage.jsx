import axios from "axios";
import dayjs from "dayjs";
import "./CheckoutPage.css";
import { useState, useEffect } from "react";
import { formatMoney } from "../../utils/money";
import { CheckoutHeader } from "./CheckoutHeader";
import { useNavigate } from "react-router";
export function CheckoutPage({ cart, loadCart }) {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [editingQuantityProductId, setEditingQuantityProductId] = useState(null);
  const [quantityDrafts, setQuantityDrafts] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const navigate = useNavigate();

  const createOrder = async () => {
    await axios.post("/api/orders");
    await loadCart();
    navigate("/orders");
  };

  const updateDeliveryOption = async (productId, deliveryOptionId) => {
    await axios.put(`/api/cart-items/${productId}`, {
      deliveryOptionId: deliveryOptionId,
    });
    await loadCart();
  };

  const startEditingQuantity = (productId, quantity) => {
    setEditingQuantityProductId(productId);
    setQuantityDrafts((previousDrafts) => ({
      ...previousDrafts,
      [productId]: String(quantity),
    }));
  };

  const updateCartItemQuantity = async (productId) => {
    const draftValue = quantityDrafts[productId];
    const nextQuantity = Number(draftValue);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1 || nextQuantity > 10) {
      setQuantityErrors((previousErrors) => ({
        ...previousErrors,
        [productId]: "Quantity must be between 1 and 10.",
      }));
      return;
    }

    setQuantityErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      delete nextErrors[productId];
      return nextErrors;
    });

    await axios.put(`/api/cart-items/${productId}`, {
      quantity: nextQuantity,
    });
    await loadCart();
    setEditingQuantityProductId(null);
  };

  useEffect(() => {
    const fetchCheckoutData =  async () => {
      const response = await axios
        .get("/api/delivery-options?expand=estimatedDeliveryTime");
          setDeliveryOptions(response.data);
    };
    fetchCheckoutData();
  }, []);

  useEffect(() => {
    const refreshCheckout = async () => {
      const response = await axios.get("./api/payment-summary");
        setPaymentSummary(response.data);
    };
    refreshCheckout();
  }, [cart]);
  return (
    <>
      <title>Checkout</title>
      <link rel="icon" type="image/svg+xml" href="cart-favicon.png" />
      <CheckoutHeader />

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <div className="order-summary">
            {deliveryOptions.length > 0 &&
              cart.map((cartItem) => {
                const selectedDeliveryOption = deliveryOptions.find(
                  (deliveryOption) => {
                    return deliveryOption.id === cartItem.deliveryOptionId;
                  },
                );
                const deleteCartItem = async () => {
                  await axios.delete(`/api/cart-items/${cartItem.productId}`);
                  await loadCart();
                };
                const isEditingQuantity = editingQuantityProductId === cartItem.productId;
                const currentQuantityDraft = quantityDrafts[cartItem.productId] ?? String(cartItem.quantity);
                const quantityError = quantityErrors[cartItem.productId];

                return (
                  <div key={cartItem.productId} className="cart-item-container">
                    <div className="delivery-date">
                      Delivery date:{" "}
                      {dayjs(
                        selectedDeliveryOption.estimatedDeliveryTimeMs,
                      ).format("dddd, MMMM D")}
                    </div>

                    <div className="cart-item-details-grid">
                      <img
                        className="product-image"
                        src={cartItem.product.image}
                      />

                      <div className="cart-item-details">
                        <div className="product-name">
                          {cartItem.product.name}
                        </div>
                        <div className="product-price">
                          {formatMoney(cartItem.product.priceCents)}
                        </div>

                        {isEditingQuantity ? (
                          <div className="quantity-editor">
                            <label className="quantity-editor-label" htmlFor={`quantity-${cartItem.productId}`}>
                              Quantity
                            </label>
                            <div className="quantity-editor-controls">
                              <input
                                id={`quantity-${cartItem.productId}`}
                                className={`quantity-input ${quantityError ? "invalid" : ""}`.trim()}
                                type="number"
                                min="1"
                                max="10"
                                value={currentQuantityDraft}
                                onChange={(event) => {
                                  setQuantityDrafts((previousDrafts) => ({
                                    ...previousDrafts,
                                    [cartItem.productId]: event.target.value,
                                  }));

                                  if (quantityError) {
                                    setQuantityErrors((previousErrors) => {
                                      const nextErrors = { ...previousErrors };
                                      delete nextErrors[cartItem.productId];
                                      return nextErrors;
                                    });
                                  }
                                }}
                              />
                              <button
                                className="quantity-action-button button-primary"
                                onClick={() => updateCartItemQuantity(cartItem.productId)}
                              >
                                Save
                              </button>
                              <button
                                className="quantity-action-button button-secondary"
                                onClick={() => {
                                  setEditingQuantityProductId(null);
                                  setQuantityErrors((previousErrors) => {
                                    const nextErrors = { ...previousErrors };
                                    delete nextErrors[cartItem.productId];
                                    return nextErrors;
                                  });
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                            {quantityError && (
                              <div className="quantity-error-message">
                                {quantityError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="product-quantity">
                            <span>
                              Quantity:{" "}
                              <span className="quantity-label">
                                {cartItem.quantity}
                              </span>
                            </span>
                            <div className="product-quantity-actions">
                              <button
                                className="quantity-link-button link-primary"
                                onClick={() =>
                                  startEditingQuantity(
                                    cartItem.productId,
                                    cartItem.quantity,
                                  )
                                }
                              >
                                Update
                              </button>
                              <button
                                className="quantity-link-button link-primary danger-link"
                                onClick={deleteCartItem}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="delivery-options">
                        <div className="delivery-options-title">
                          Choose a delivery option:
                        </div>
                        {deliveryOptions.map((deliveryOption) => {
                          let priceString = "FREE Shipping";
                          if (deliveryOption.priceCents > 0) {
                            priceString = `${formatMoney(deliveryOption.priceCents)} - Shipping`;
                          }
                          return (
                            <div
                              key={deliveryOption.id}
                              className="delivery-option"
                              onClick={() =>
                                updateDeliveryOption(
                                  cartItem.productId,
                                  deliveryOption.id,
                                )
                              }
                              style={{ cursor: 'pointer' }}
                            >
                              <input
                                type="radio"
                                checked={
                                  deliveryOption.id ===
                                  cartItem.deliveryOptionId
                                }
                                onChange = {() => {}}
                                className="delivery-option-input"
                                name={`delivery-option-${cartItem.productId}`}
                              />
                              <div>
                                <div className="delivery-option-date">
                                  {dayjs(
                                    deliveryOption.estimatedDeliveryTimeMs,
                                  ).format("dddd, MMMM D")}
                                </div>
                                <div className="delivery-option-price">
                                  {priceString}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="payment-summary">
            <div className="payment-summary-title">Payment Summary</div>
            {paymentSummary && (
              <>
                <div className="payment-summary-row">
                  <div>Items (3):</div>
                  <div className="payment-summary-money">
                    {formatMoney(paymentSummary.productCostCents)}
                  </div>
                </div>

                <div className="payment-summary-row">
                  <div>Shipping &amp; handling:</div>
                  <div className="payment-summary-money">
                    {formatMoney(paymentSummary.shippingCostCents)}
                  </div>
                </div>

                <div className="payment-summary-row subtotal-row">
                  <div>Total before tax:</div>
                  <div className="payment-summary-money">
                    {formatMoney(paymentSummary.totalCostBeforeTaxCents)}
                  </div>
                </div>

                <div className="payment-summary-row">
                  <div>Estimated tax (10%):</div>
                  <div className="payment-summary-money">
                    {formatMoney(paymentSummary.taxCents)}
                  </div>
                </div>

                <div className="payment-summary-row total-row">
                  <div>Order total:</div>
                  <div className="payment-summary-money">
                    {formatMoney(paymentSummary.totalCostCents)}
                  </div>
                </div>

                <button className="place-order-button button-primary"
                onClick={createOrder}>
                  Place your order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
