{filteredChats.map((title, index) => (
  <button
    key={index}
    onClick={() => handleSend(`Vamos retomar o tópico sobre: ${title}`)}
    className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:bg-[#181b24] hover:text-gray-200 transition-colors truncate text-left"
  >
    <span>💬</span>
    <span className="truncate">{title}</span>
  </button>
))}
