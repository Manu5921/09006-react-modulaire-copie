export default function RegisterForm() {
  return (
    <form className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Register Form (from Auth Module)</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input type="text" className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" className="w-full px-3 py-2 border rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input type="password" className="w-full px-3 py-2 border rounded-md" />
      </div>
      <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">
        Register
      </button>
    </form>
  );
}
