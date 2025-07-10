const SummaryModal = ({ summaryData, onClose }) => {
    if (!summaryData) return null;

    const speakSummary = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1; // speed (0.1 to 10)
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-2 sm:px-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md sm:max-w-xl shadow-xl relative overflow-y-auto max-h-[90vh]">
                <img
                    src={summaryData.image}
                    alt="Summary"
                    className="w-full h-48 sm:h-64 object-cover rounded mb-4"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/no-image.jpeg";
                    }}
                />

                <h2 className="text-lg sm:text-2xl font-bold mb-2">
                    {summaryData.title}
                </h2>

                <p className="text-gray-700 text-sm sm:text-base">{summaryData.summary}</p>

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                    <button
                        onClick={() => speakSummary(summaryData.summary)}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm sm:text-base"
                    >
                        🔊 Listen Summary
                    </button>

                    <button
                        onClick={() => {
                            window.speechSynthesis.cancel();
                            onClose();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
