export default function LoginForm() {
  return (
    <form className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Login Form (from Auth Module)</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" className="w-full px-3 py-2 border rounded-md" />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
        Login
      </button>
    </form>
  );
}
