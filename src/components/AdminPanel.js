// src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантажити всіх користувачів з Firestore
  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Перемикання доступу
  const toggleApproval = async (userId, current) => {
    await updateDoc(doc(db, "users", userId), {
      approved: !current,
    });
    fetchUsers(); // оновити список
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👤 Панель адміністратора</h2>
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Доступ</th>
              <th>Дія</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.approved ? "✅ Дозволено" : "⛔ Заборонено"}</td>
                <td>
                  <button
                    onClick={() => toggleApproval(u.id, u.approved)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      backgroundColor: u.approved ? "#f44336" : "#4caf50",
                      color: "white",
                      border: "none",
                    }}
                  >
                    {u.approved ? "Заборонити" : "Надати доступ"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
