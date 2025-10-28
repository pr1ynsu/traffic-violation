export default function GovernmentLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white border border-black rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Government Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 mb-4 border border-gray-400 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 mb-6 border border-gray-400 rounded-lg"
        />
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Log In
        </button>
      </div>
    </div>
  );
}
