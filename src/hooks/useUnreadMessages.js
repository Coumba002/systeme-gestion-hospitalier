import { useState, useEffect } from "react";
import { getMessages } from "../api";

/**
 * Hook pour compter les messages non-lus de l'utilisateur courant.
 * Auto-refresh toutes les 30 secondes.
 *
 * @param {number} userId - ID de l'utilisateur connecté (destinataire)
 * @returns {number} nombre de messages non-lus
 */
export function useUnreadMessages(userId) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function fetchUnread() {
      try {
        const messages = await getMessages();
        const arr = Array.isArray(messages) ? messages : messages.data || [];
        const unread = arr.filter(m =>
          m.destinataire_id === userId &&
          (m.lu === false || m.lu === 0 || m.lu === null || m.lu === undefined)
        ).length;
        if (!cancelled) setCount(unread);
      } catch {
        // silencieux : pas grave si le polling échoue
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // toutes les 30s
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId]);

  return count;
}
