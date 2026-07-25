const studentListStyles = {
  container: "flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6",
  card: "w-full max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200",
  title: "text-2xl font-bold mb-6 text-center text-gray-700",
  subtitle: "text-xl font-semibold mb-4 text-center text-gray-600",
  buttonGroup: "flex flex-wrap justify-center items-center gap-4 mb-6",
  sectionButton: (isActive) =>
    `py-3 px-5 text-md font-semibold transition duration-300 rounded-lg 
    ${isActive ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-300 text-gray-700 hover:bg-yellow-400'}`,
  subjectButton: (isActive) =>
    `py-3 px-5 text-md font-semibold transition duration-300 rounded-lg 
    ${isActive ? 'bg-green-500 text-white shadow-md' : 'bg-green-300 text-gray-700 hover:bg-green-400'}`,
  tableContainer: "mt-6 w-full",
};

export default studentListStyles;
