import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    Unsubscribe,
    updateDoc,
    where,
} from "firebase/firestore";
import { Order, OrderStatus } from "../../types/order.types";
import { auth, db } from "./config";

const ORDERS_COLLECTION = "orders";

/**
 * Create new order
 */
export const createOrder = async (
  order: Omit<Order, "id">,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db!, ORDERS_COLLECTION), {
      ...order,
      createdAt: Timestamp.fromMillis(order.createdAt),
      updatedAt: Timestamp.fromMillis(order.updatedAt),
    });
    return docRef.id;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("[orderService] createOrder failed", {
      error,
      currentUser: auth?.currentUser?.uid ?? null,
    });
    throw new Error(error.message || "Failed to create order");
  }
};

/**
 * Fetch user orders
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db!, ORDERS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
      } as Order;
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("[orderService] fetchUserOrders failed", {
      userId,
      error,
      currentUser: auth?.currentUser?.uid ?? null,
    });
    throw new Error(error.message || "Failed to fetch orders");
  }
};

/**
 * Fetch all orders (Admin)
 */
export const fetchAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db!, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
      } as Order;
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("[orderService] fetchAllOrders failed", {
      error,
      currentUser: auth?.currentUser?.uid ?? null,
    });
    throw new Error(error.message || "Failed to fetch orders");
  }
};

/**
 * Fetch single order
 */
export const fetchOrder = async (orderId: string): Promise<Order> => {
  try {
    const docRef = doc(db!, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Order not found");
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toMillis(),
      updatedAt: data.updatedAt.toMillis(),
    } as Order;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("[orderService] fetchOrder failed", {
      orderId,
      error,
      currentUser: auth?.currentUser?.uid ?? null,
    });
    throw new Error(error.message || "Failed to fetch order");
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<void> => {
  try {
    const docRef = doc(db!, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("[orderService] updateOrderStatus failed", {
      orderId,
      status,
      error,
      currentUser: auth?.currentUser?.uid ?? null,
    });
    throw new Error(error.message || "Failed to update order status");
  }
};

/**
 * Subscribe to user orders in realtime.
 */
export const subscribeToUserOrders = (
  userId: string,
  onData: (orders: Order[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const q = query(
    collection(db!, ORDERS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          ...data,
          createdAt: data.createdAt.toMillis(),
          updatedAt: data.updatedAt.toMillis(),
        } as Order;
      });
      onData(orders);
    },
    (error: any) => {
      if (onError)
        onError(
          new Error(error?.message || "Realtime order subscription failed"),
        );
    },
  );
};
