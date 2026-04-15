/*  reuable page layout for algo visualisations to ensure consistent layout for all algorithm implementations*/

export default function AlgorithmLayout({
    title,
    algoInfo,
    visualisation,
    metrics,
    controls,
    graphEditor,
    whyThisStep,
    editorLabel = "Graph Editor",
}) {
    return (
        /* full height layout minus navbar height (80px) */
        <div className="h-[calc(100vh-80px)] bg-gray-50 flex flex-col overflow-hidden">

            {/*Main content area*/}
            <main className="flex-1 w-full max-w-full px-8 py-6 flex flex-col gap-6 min-h-0">
                
                {/*Algorithm page header*/}
                <section className="rounded-md border bg-white p-4 h-20 flex-shrink-0 flex items-center justify-center">
                    <h1 className="text-xl font-bold">{title}</h1>
                </section>
                
                <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-6 min-h-0">
                    {/*Left panels*/}
                    <div className="col-span-3 row-span-2 flex flex-col gap-6">
                        
                        {/*Algorithm Info Panel*/}
                        <aside className="flex-1 rounded-md border bg-white p-4 overflow-auto">
                            <h2 className="mb-2 font-semibold">Algorithm Info</h2>
                            {algoInfo}
                        </aside>

                        {/*Graph Editor panel*/}
                        <aside className="flex-1 rounded-md border bg-white p-4 overflow-auto">
                            <h2 className="mb-2 font-semibold">{editorLabel}</h2>
                            {graphEditor}
                        </aside>
                    </div>

                    {/*Visualisation area*/}
                    <section className="col-span-6 row-span-2 rounded-md border bg-white flex flex-col overflow-hidden">
                        <div className="flex-1 p-4 overflow-auto">
                            {visualisation}
                        </div>

                        <div className="border-t"></div>

                        <div className="p-4 h-20 flex-shrink-0">
                            {controls}
                        </div>
                        
                    </section>

                    {/*Right Panels*/}
                    <div className="col-span-3 row-span-2 flex flex-col gap-6">

                        {/*Metrics Panel*/}
                        <section className="flex-1 rounded-md border bg-white p-4 overflow-auto">
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="mb-2 font-semibold">Dynamic Info</h2>
                            </div>
                            {metrics}
                        </section>

                        {/*Why This Step Panel*/}
                        <section className="flex-1 rounded-md border bg-white p-4 overflow-auto">
                            <h2 className="mb-2 font-semibold">Why this step?</h2>
                            {whyThisStep}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}