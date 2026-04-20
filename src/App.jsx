import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import Dijkstra from "./pages/graph-pathfinding/Dijkstra";
import AStar from "./pages/graph-pathfinding/AStar";
import BFS from "./pages/graph-pathfinding/BFS";
import DFS from "./pages/graph-pathfinding/DFS";

import Bubble from "./pages/sorting/Bubble";
import Merge from "./pages/sorting/Merge";
import Quick from "./pages/sorting/Quick";
import Heap from "./pages/sorting/Heap";

import BSTSearch from "./pages/bst/BSTSearch";
import BSTInsert from "./pages/bst/BSTInsert";
import BSTDelete from "./pages/bst/BSTDelete";

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
        <Route path="/sorting/bubble" element={<Bubble />} />
        <Route path="/sorting/merge" element={<Merge />} />
        <Route path="/sorting/quick" element={<Quick />} />
        <Route path="/sorting/heap" element={<Heap />} />

        {/* BST pages */}
        <Route path="/bst/search" element={<BSTSearch />} />
        <Route path="/bst/insert" element={<BSTInsert />} />
        <Route path="/bst/delete" element={<BSTDelete />} />
      
      </Routes>
    </BrowserRouter>
  );
}
