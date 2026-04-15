import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import Dijkstra from "./pages/Dijkstra";
import AStar from "./pages/AStar";
import BFS from "./pages/BFS";
import DFS from "./pages/DFS";

import BSTSearch from "./pages/BSTSearch";
import BSTInsert from "./pages/BSTInsert";
import BSTDelete from "./pages/BSTDelete";

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
        <Route path="/a-star" element={<AStar />} />
        <Route path="/bfs" element={<BFS />} />
        <Route path="/dfs" element={<DFS />} />

        {/* Sorting pages */}
        <Route path="/sorting/bubble" element={<Placeholder />} />
        <Route path="/sorting/merge" element={<Placeholder />} />
        <Route path="/sorting/quick" element={<Placeholder />} />
        <Route path="/sorting/heap" element={<Placeholder />} />

        {/* BST pages */}
        <Route path="/bst/search" element={<BSTSearch />} />
        <Route path="/bst/insert" element={<BSTInsert />} />
        <Route path="/bst/delete" element={<BSTDelete />} />
      
      </Routes>
    </BrowserRouter>
  );
}
