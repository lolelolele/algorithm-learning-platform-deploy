import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dijkstra from "./pages/Dijkstra";
import BFS from "./pages/BFS"
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (

    /* BrowserRouter enables client-side routing without full page reloads */
    <BrowserRouter>
      <Navbar />

      {/* Route table for the application */}
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Graph Pathfinding pages */}
        <Route path="/dijkstra" element={<Dijkstra />} />
        <Route path="/a-star" element={<Placeholder />} />
        <Route path="/bfs" element={<BFS />} />
        <Route path="/dfs" element={<Placeholder />} />

        {/* Sorting pages */}
        <Route path="/sorting/bubble" element={<Placeholder />} />
        <Route path="/sorting/merge" element={<Placeholder />} />
        <Route path="/sorting/quick" element={<Placeholder />} />
        <Route path="/sorting/heap" element={<Placeholder />} />

        {/* BST pages */}
        <Route path="/bst/search" element={<Placeholder />} />
        <Route path="/bst/insert" element={<Placeholder />} />
        <Route path="/bst/delete" element={<Placeholder />} />
      
      </Routes>
    </BrowserRouter>
  );
}
