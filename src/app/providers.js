"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { store, persistor } from "@/redux/store";
import { setCartOwner } from "@/redux/cartSlice";
import { ToastProvider } from "./components/Toast";

/**
 * Watches the NextAuth session and keeps the cart's ownerId in sync.
 * Whenever the signed-in user id changes (guest -> user A, user A -> user B,
 * user -> logout), the cart slice wipes itself so one account never sees
 * another account's basket on a shared browser/computer.
 */
function CartOwnerSync() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "loading") return;
    const currentUserId = session?.user?.id || null;
    dispatch(setCartOwner(currentUserId));
  }, [session?.user?.id, status, dispatch]);

  return null;
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <CartOwnerSync />
          <ToastProvider>{children}</ToastProvider>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
