import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react";

// algorithm data for the carousel
const algorithms = [
    {
        name: "Dijkstra's Algorithm",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "Finds the shortest path between nodes in a weighted graph by greedily selecting the lowest-cost frontier node at each step.",
        path: "/dijkstra",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                {/* edges */}
                <line x1="20" y1="40" x2="60" y2="20" stroke="#93c5fd" strokeWidth="2"/>
                <line x1="20" y1="40" x2="60" y2="60" stroke="#93c5fd" strokeWidth="2"/>
                <line x1="60" y1="20" x2="100" y2="40" stroke="#86efac" strokeWidth="2.5"/>
                <line x1="60" y1="60" x2="100" y2="40" stroke="#93c5fd" strokeWidth="2"/>
                <line x1="60" y1="20" x2="60" y2="60" stroke="#93c5fd" strokeWidth="2"/>
                {/* weight labels */}
                <text x="36" y="26" fontSize="8" fill="#6b7280">4</text>
                <text x="36" y="56" fontSize="8" fill="#6b7280">7</text>
                <text x="78" y="26" fontSize="8" fill="#16a34a">2</text>
                <text x="78" y="56" fontSize="8" fill="#6b7280">5</text>
                {/* nodes */}
                <circle cx="20" cy="40" r="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                <circle cx="60" cy="20" r="10" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
                <circle cx="60" cy="60" r="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                <circle cx="100" cy="40" r="10" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2"/>
                {/* labels */}
                <text x="20" y="44" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">A</text>
                <text x="60" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">B</text>
                <text x="60" y="64" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">C</text>
                <text x="100" y="44" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">D</text>
            </svg>
        ),
    },
    {
        name: "A* Search",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "An informed search algorithm that combines actual path cost with a heuristic estimate to find the shortest path faster than Dijkstra.",
        path: "/a-star",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                <line x1="20" y1="40" x2="60" y2="20" stroke="#93c5fd" strokeWidth="2"/>
                <line x1="60" y1="20" x2="100" y2="40" stroke="#86efac" strokeWidth="2.5"/>
                <line x1="20" y1="40" x2="60" y2="60" stroke="#93c5fd" strokeWidth="2"/>
                <line x1="60" y1="60" x2="100" y2="40" stroke="#93c5fd" strokeWidth="2"/>
                <circle cx="20" cy="40" r="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                <circle cx="60" cy="20" r="10" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
                <circle cx="60" cy="60" r="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                <circle cx="100" cy="40" r="10" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2"/>
                <text x="20" y="44" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">S</text>
                <text x="60" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">B</text>
                <text x="60" y="64" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">C</text>
                <text x="100" y="44" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">G</text>
                <text x="38" y="26" fontSize="7" fill="#6b7280">h=3</text>
                <text x="78" y="26" fontSize="7" fill="#16a34a">h=0</text>
            </svg>
        ),
    },
    {
        name: "Breadth-First Search",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "Explores a graph level by level using a queue, guaranteeing the shortest path in an unweighted graph.",
        path: "/bfs",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                <line x1="60" y1="15" x2="30" y2="40" stroke="#93c5fd" strokeWidth="2"/>
                <line x1="60" y1="15" x2="90" y2="40" stroke="#93c5fd" strokeWidth="2"/>
                <line x1="30" y1="40" x2="15" y2="65" stroke="#bfdbfe" strokeWidth="1.5"/>
                <line x1="30" y1="40" x2="45" y2="65" stroke="#bfdbfe" strokeWidth="1.5"/>
                <line x1="90" y1="40" x2="75" y2="65" stroke="#bfdbfe" strokeWidth="1.5"/>
                <line x1="90" y1="40" x2="105" y2="65" stroke="#bfdbfe" strokeWidth="1.5"/>
                <circle cx="60" cy="15" r="10" fill="#fde68a" stroke="#d97706" strokeWidth="2"/>
                <circle cx="30" cy="40" r="10" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
                <circle cx="90" cy="40" r="10" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
                <circle cx="15" cy="65" r="8"  fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="45" cy="65" r="8"  fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="75" cy="65" r="8"  fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="105" cy="65" r="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <text x="60" y="19" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">1</text>
                <text x="30" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">2</text>
                <text x="90" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">3</text>
            </svg>
        ),
    },
    {
        name: "Depth-First Search",
        category: "Graph Pathfinding",
        categoryColour: "bg-blue-100 text-blue-700",
        description: "Explores as deep as possible along each branch before backtracking, using a stack to track the current path.",
        path: "/dfs",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                <line x1="60" y1="15" x2="30" y2="40" stroke="#fde68a" strokeWidth="2.5"/>
                <line x1="60" y1="15" x2="90" y2="40" stroke="#bfdbfe" strokeWidth="1.5"/>
                <line x1="30" y1="40" x2="15" y2="65" stroke="#fde68a" strokeWidth="2.5"/>
                <line x1="30" y1="40" x2="45" y2="65" stroke="#bfdbfe" strokeWidth="1.5"/>
                <circle cx="60" cy="15" r="10" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
                <circle cx="30" cy="40" r="10" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
                <circle cx="90" cy="40" r="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5"/>
                <circle cx="15" cy="65" r="8"  fill="#fde68a" stroke="#d97706" strokeWidth="2"/>
                <circle cx="45" cy="65" r="8"  fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5"/>
                <text x="60" y="19" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">A</text>
                <text x="30" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">B</text>
                <text x="90" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">C</text>
                <text x="15" y="69" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">D</text>
            </svg>
        ),
    },
    {
        name: "Bubble Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Repeatedly compares adjacent elements and swaps them if out of order. Simple to understand and great for learning swap-based sorting.",
        path: "/sorting/bubble",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                {[38, 27, 43, 10, 18].map((val, i) => (
                    <g key={i}>
                        <rect
                            x={8 + i * 22} y={25}
                            width={18} height={30}
                            rx={3}
                            fill={i === 1 ? "#fde68a" : i === 2 ? "#fde68a" : i === 4 ? "#bbf7d0" : "#f1f5f9"}
                            stroke={i === 1 ? "#d97706" : i === 2 ? "#d97706" : i === 4 ? "#16a34a" : "#94a3b8"}
                            strokeWidth={1.5}
                        />
                        <text x={17 + i * 22} y={45} textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e293b">{val}</text>
                    </g>
                ))}
                <path d="M 26 58 Q 37 70 48 58" fill="none" stroke="#d97706" strokeWidth="1.5" markerEnd="url(#arrowHome)"/>
                <defs>
                    <marker id="arrowHome" markerWidth="5" markerHeight="5" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L5,3 L0,6 Z" fill="#d97706"/>
                    </marker>
                </defs>
                <text x="37" y="76" textAnchor="middle" fontSize="7" fill="#d97706">swap</text>
            </svg>
        ),
    },
    {
        name: "Merge Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Divides the array in half recursively then merges sorted halves back together. Guarantees O(n log n) in all cases.",
        path: "/sorting/merge",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                {/* root */}
                <rect x="35" y="5" width="50" height="18" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <text x="60" y="18" textAnchor="middle" fontSize="8" fill="#1e293b">38 27 43 10</text>
                {/* left child */}
                <rect x="8" y="33" width="44" height="18" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <text x="30" y="46" textAnchor="middle" fontSize="8" fill="#1e293b">38  27</text>
                {/* right child */}
                <rect x="68" y="33" width="44" height="18" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <text x="90" y="46" textAnchor="middle" fontSize="8" fill="#1e293b">43  10</text>
                {/* merged */}
                <rect x="28" y="61" width="64" height="16" rx="3" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
                <text x="60" y="73" textAnchor="middle" fontSize="8" fill="#1e293b">10 27 38 43</text>
                {/* edges */}
                <line x1="55" y1="23" x2="30" y2="33" stroke="#94a3b8" strokeWidth="1.2"/>
                <line x1="65" y1="23" x2="90" y2="33" stroke="#94a3b8" strokeWidth="1.2"/>
                <line x1="30" y1="51" x2="50" y2="61" stroke="#94a3b8" strokeWidth="1.2"/>
                <line x1="90" y1="51" x2="70" y2="61" stroke="#94a3b8" strokeWidth="1.2"/>
            </svg>
        ),
    },
    {
        name: "Quick Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Selects a pivot and partitions elements into smaller and larger groups, then recursively sorts each partition.",
        path: "/sorting/quick",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                {[15, 13, 82, 27, 40].map((val, i) => (
                    <g key={i}>
                        <rect
                            x={8 + i * 22} y={10}
                            width={18} height={24}
                            rx={3}
                            fill={i === 3 ? "#e9d5ff" : i === 0 || i === 1 ? "#bfdbfe" : "#fed7aa"}
                            stroke={i === 3 ? "#7c3aed" : i === 0 || i === 1 ? "#3b82f6" : "#f97316"}
                            strokeWidth={1.5}
                        />
                        <text x={17 + i * 22} y={26} textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e293b">{val}</text>
                    </g>
                ))}
                <text x="60" y="52" textAnchor="middle" fontSize="8" fill="#7c3aed" fontWeight="600">pivot = 27</text>
                <text x="25" y="65" textAnchor="middle" fontSize="7" fill="#3b82f6">≤ 27</text>
                <text x="90" y="65" textAnchor="middle" fontSize="7" fill="#f97316">&gt; 27</text>
                <line x1="60" y1="54" x2="35" y2="62" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="60" y1="54" x2="85" y2="62" stroke="#94a3b8" strokeWidth="1"/>
            </svg>
        ),
    },
    {
        name: "Heap Sort",
        category: "Sorting",
        categoryColour: "bg-purple-100 text-purple-700",
        description: "Builds a max-heap from the array then repeatedly extracts the maximum to build the sorted result in-place.",
        path: "/sorting/heap",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                <line x1="60" y1="18" x2="35" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="60" y1="18" x2="85" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="35" y1="38" x2="22" y2="58" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="35" y1="38" x2="48" y2="58" stroke="#94a3b8" strokeWidth="1.5"/>
                <circle cx="60" cy="12" r="10" fill="#fde68a" stroke="#d97706" strokeWidth="2"/>
                <circle cx="35" cy="38" r="10" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                <circle cx="85" cy="38" r="10" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                <circle cx="22" cy="58" r="8"  fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                <circle cx="48" cy="58" r="8"  fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
                <text x="60" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">90</text>
                <text x="35" y="42" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">70</text>
                <text x="85" y="42" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">54</text>
                <text x="22" y="62" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">19</text>
                <text x="48" y="62" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">36</text>
            </svg>
        ),
    },
    {
        name: "BST Operations",
        category: "BST",
        categoryColour: "bg-green-100 text-green-700",
        description: "Visualise search, insert, and delete operations on a Binary Search Tree — showing how the BST property is maintained at every step.",
        path: "/bst/search",
        illustration: (
            <svg viewBox="0 0 120 80" className="w-full h-full">
                <line x1="60" y1="15" x2="35" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="60" y1="15" x2="85" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="35" y1="38" x2="22" y2="60" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="35" y1="38" x2="48" y2="60" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="85" y1="38" x2="98" y2="60" stroke="#94a3b8" strokeWidth="1.5"/>
                <circle cx="60" cy="15" r="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                <circle cx="35" cy="38" r="10" fill="#fde68a" stroke="#d97706" strokeWidth="2"/>
                <circle cx="85" cy="38" r="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="22" cy="60" r="8"  fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="48" cy="60" r="8"  fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
                <circle cx="98" cy="60" r="8"  fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
                <text x="60" y="19" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">50</text>
                <text x="35" y="42" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">30</text>
                <text x="85" y="42" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">70</text>
                <text x="22" y="64" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">20</text>
                <text x="48" y="64" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">40</text>
                <text x="98" y="64" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e293b">80</text>
            </svg>
        ),
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