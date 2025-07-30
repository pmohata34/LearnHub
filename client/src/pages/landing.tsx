import { Link } from "wouter";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 px-4 py-12 text-center">
      <h1 className="text-5xl font-extrabold text-indigo-700 mb-6">Welcome to LearnHub</h1>
      <p className="text-lg text-gray-700 mb-8 max-w-xl">
        Master Computer Science with curated video courses, quizzes, and certifications — all in one platform designed for college students.
      </p>
      <div className="flex gap-6">
        <Link href="/login">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">Login</button>
        </Link>
        <Link href="/signup">
          <button className="px-6 py-3 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium rounded-xl transition">Signup</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
