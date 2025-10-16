import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";

// Import các page
import Home from "./pages/Home";
import Alphabet from "./pages/Alphabet";
import Vocabulary from "./pages/Vocabulary";
import Grammar from "./pages/Grammar";
import Kanji from "./pages/Kanji";
import Flashcard from "./pages/Flashcard";
import Test from "./pages/Test";

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen from-sky-50 via-pink-50 to-indigo-50">
      <Header />
      <main className=" ">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/alphabet" element={<Alphabet />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/grammar" element={<Grammar />} />
              <Route path="/kanji" element={<Kanji />} />
              <Route path="/flashcard" element={<Flashcard />} />
              <Route path="/test" element={<Test />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
