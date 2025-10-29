import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [newName, setNewName] = useState("");
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const res = await axios.get("http://localhost:4000/restaurants");
    setRestaurants(res.data);
  };

  const addRestaurant = async () => {
    if (!newName.trim()) return;
    const res = await axios.post("http://localhost:4000/restaurants", { name: newName });
    setRestaurants([...restaurants, res.data]);
    setNewName("");
  };

  const deleteRestaurant = async (id) => {
    await axios.delete(`http://localhost:4000/restaurants/${id}`);
    setRestaurants(restaurants.filter(r => r._id !== id));
  };

  const resetAll = async () => {
    await axios.delete("http://localhost:4000/restaurants");
    setRestaurants([]);
    setWinner(null);
  };

  const spin = () => {
    if (!restaurants.length) return;
    setLoading(true);
    setWinner(null);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      const chosen = { 
        ...restaurants[randomIndex], 
        colorIndex: randomIndex % 6 
      };
      setWinner(chosen);
      axios.post("http://localhost:4000/winners", { name: chosen.name });
      setLoading(false);
    }, 2000);
  };

  const closeOverlay = () => setWinner(null);

  return (
    <div className="page">
      <h1 className="title">Friday Lunch Randomizer</h1>

      <div className="add-section">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Add restaurant..."
          className="input"
        />
        <button onClick={addRestaurant} className="btn add-btn">Add</button>
        <button onClick={resetAll} className="btn reset-btn">Reset</button>
      </div>

      <div className="notes-board">
        <AnimatePresence>
          {restaurants.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className={`note note-${(i % 6) + 1}`}
            >
              <p className="note-text">{r.name}</p>
              <button className="delete-btn" onClick={() => deleteRestaurant(r._id)}>✖</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="spin-section">
        <button onClick={spin} disabled={loading} className="btn spin-btn">
          {loading ? "Spinning..." : "Spin!"}
        </button>
      </div>
      <AnimatePresence>
        {winner && (
          <motion.div
            className="winner-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
            <h1 className="winner-text">WINNER</h1>
            </div>
            <motion.div
              className={`winner-card note note-${(winner.colorIndex ?? 0) + 1}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <p className="note-text">{winner.name}</p>
              <button onClick={closeOverlay} className="close-overlay">✖</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}