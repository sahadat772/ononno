"use client";

export default function Error() {
  return (
    <div className="py-24 text-center">

      <h2 className="text-2xl font-bold text-red-500">
        Something went wrong
      </h2>

      <p className="text-gray-500 mt-2">
        Failed to load curriculum.
      </p>

    </div>
  );
}