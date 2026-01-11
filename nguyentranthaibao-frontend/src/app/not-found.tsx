import Link from "next/link";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <FaExclamationTriangle className="text-yellow-500 text-6xl mb-4 animate-bounce" />

        <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>

        <p className="text-xl text-gray-600 mb-6">
          Oops! The page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </Link>
      </div>

      {/* Illustration */}
      <div className="mt-10">
        <img
          src="/404.svg"
          alt="Not Found"
          className="w-80 max-w-full mx-auto opacity-80"
        />
      </div>
    </div>
  );
}
