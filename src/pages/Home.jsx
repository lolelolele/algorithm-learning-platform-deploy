import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react";
import dijkstraImg from "../assets/carousel/dijkstra.png";
import astarImg from "../assets/carousel/astar.png";
import bfsImg from "../assets/carousel/bfs.png";
import dfsImg from "../assets/carousel/dfs.png";
import bubbleImg from "../assets/carousel/bubble.png";
import mergeImg from "../assets/carousel/merge.png";
import quickImg from "../assets/carousel/quick.png";
import heapImg from "../assets/carousel/heap.png";
import bstImg from "../assets/carousel/bst.png";

// algorithm data for the carousel
const algorithms = [
    {
        name: "Dijkstra's Algorithm",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "Finds the shortest path between nodes in a weighted graph by greedily selecting the lowest-cost frontier node at each step.",
        path: "/dijkstra",
        illustration: <img src={dijkstraImg} alt="Dijkstra's Algorithm" className="w-full h-full object-contain" />,
    },
    {
        name: "A* Search",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "An informed search algorithm that combines actual path cost with a heuristic estimate to find the shortest path faster than Dijkstra.",
        path: "/a-star",
        illustration: <img src={astarImg} alt="A* Search" className="w-full h-full object-contain" />,
    },
    {
        name: "Breadth-First Search",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "Explores a graph level by level using a queue, guaranteeing the shortest path in an unweighted graph.",
        path: "/bfs",
        illustration: <img src={bfsImg} alt="Breadth-First Search" className="w-full h-full object-contain" />,
    },
    {
        name: "Depth-First Search",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "Explores as deep as possible along each branch before backtracking, using a stack to track the current path.",
        path: "/dfs",
        illustration: <img src={dfsImg} alt="Depth-First Search" className="w-full h-full object-contain" />,
    },
    {
        name: "Bubble Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Repeatedly compares adjacent elements and swaps them if out of order. Simple to understand and great for learning swap-based sorting.",
        path: "/sorting/bubble",
        illustration: <img src={bubbleImg} alt="Bubble Sort" className="w-full h-full object-contain" />,
    },
    {
        name: "Merge Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Divides the array in half recursively then merges sorted halves back together. Guarantees O(n log n) in all cases.",
        path: "/sorting/merge",
        illustration: <img src={mergeImg} alt="Merge Sort" className="w-full h-full object-contain" />,
    },
    {
        name: "Quick Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Selects a pivot and partitions elements into smaller and larger groups, then recursively sorts each partition.",
        path: "/sorting/quick",
        illustration: <img src={quickImg} alt="Quick Sort" className="w-full h-full object-contain" />,
    },
    {
        name: "Heap Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Builds a max-heap from the array then repeatedly extracts the maximum to build the sorted result in-place.",
        path: "/sorting/heap",
        illustration: <img src={heapImg} alt="Heap Sort" className="w-full h-full object-contain" />,
    },
    {
        name: "BST Operations",
        category: "BST",
        categoryColour: "bg-green-100 text-green-700",
        description: "Visualise search, insert, and delete operations on a Binary Search Tree — showing how the BST property is maintained at every step.",
        path: "/bst/search",
        illustration: <img src={bstImg} alt="BST Operations" className="w-full h-full object-contain" />,
    },
];

const howToUseSteps = [
    {
        number: "01",
        title: "Pick an Algorithm",
        description: "Choose from Graph Pathfinding, Sorting, or BST Operations using the navigation bar or the carousel below.",
    },
    {
        number: "02",
        title: "Step Through It",
        description: "Use the playback controls to step forward and backward through each stage. The Why This Step panel explains every decision.",
    },
    {
        number: "03",
        title: "Try Challenge Mode",
        description: "Test your understanding by predicting what the algorithm does next before each step is revealed.",
    },
];

const features = [
    {
        title: "Step-by-step Visualisation",
        description: "Every algorithm is broken down into individual steps with visual highlighting and plain-English explanations.",
    },
    {
        title: "Challenge Mode",
        description: "Predict what the algorithm does next before each step is revealed. Track your score as you improve.",
    },
    {
        title: "Real-time Metrics",
        description: "Track comparisons, swaps, and visited nodes live as the algorithm runs.",
    },
    {
        title: "Custom Input",
        description: "Enter your own arrays or adjust edge weights to see how different inputs affect algorithm behaviour.",
    },
];

export default function Home() {

    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef(null);

    // auto advance every 3 seconds, pause on hover
    useEffect(() => {
        if (paused) return;
        intervalRef.current = setInterval(() => {
            setCurrent(c => (c + 1) % algorithms.length);
        }, 3000);
        return () => clearInterval(intervalRef.current);
    }, [paused]);

    function prev() {
        setCurrent(c => (c - 1 + algorithms.length) % algorithms.length);
    }

    function next() {
        setCurrent(c => (c + 1) % algorithms.length);
    }

    const algo = algorithms[current];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* hero */}
            <section className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Interactive Algorithm Learning Platform
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                        Master algorithms through step-by-step visualisation. Explore graph
                        pathfinding, sorting, and binary search tree operations. Then test
                        yourself with Challenge Mode.
                    </p>
                    <Link
                        to="/dijkstra"
                        className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                        Start Learning →
                    </Link>
                </div>
            </section>

            {/* carousel */}
            <section className="max-w-5xl mx-auto px-6 py-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Explore Algorithms
                </h2>

                <div
                    className="relative bg-white rounded-xl border shadow-sm overflow-hidden"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <div className="flex items-stretch min-h-56">

                        {/* left arrow */}
                        <button
                            onClick={prev}
                            className="flex-shrink-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border-r text-2xl"
                        >
                            ‹
                        </button>

                        {/* card content */}
                        <div className="flex flex-1 items-center gap-8 px-8 py-6">

                            {/* illustration */}
                            <div className="flex-shrink-0 w-40 h-32 bg-gray-50 rounded-lg border flex items-center justify-center p-3">
                                {algo.illustration}
                            </div>

                            {/* text */}
                            <div className="flex-1 min-w-0">
                                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${algo.categoryColour}`}>
                                    {algo.category}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {algo.name}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    {algo.description}
                                </p>
                                <Link
                                    to={algo.path}
                                    className="inline-block bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Try it →
                                </Link>
                            </div>
                        </div>

                        {/* right arrow */}
                        <button
                            onClick={next}
                            className="flex-shrink-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border-l text-2xl"
                        >
                            ›
                        </button>
                    </div>

                    {/* dot indicators */}
                    <div className="flex justify-center gap-1.5 py-3 border-t bg-gray-50">
                        {algorithms.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    i === current ? "bg-gray-800" : "bg-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* how to use */}
            <section className="max-w-5xl mx-auto px-6 py-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    How to Use
                </h2>
                <div className="grid grid-cols-3 gap-6">
                    {howToUseSteps.map(step => (
                        <div key={step.number} className="bg-white rounded-xl border p-6">
                            <div className="text-2xl font-bold text-gray-200 mb-2">
                                {step.number}
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-1">
                                {step.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* features */}
            <section className="max-w-5xl mx-auto px-6 py-8 pb-16">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Features
                </h2>
                <div className="grid grid-cols-4 gap-4">
                    {features.map(f => (
                        <div key={f.title} className="bg-white rounded-xl border p-5">
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                {f.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}