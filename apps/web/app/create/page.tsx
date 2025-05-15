"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEndpointPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(24);
  const [isPersistent, setIsPersistent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/endpoints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name || undefined,
            description: description || undefined,
            duration,
            persistent: isPersistent,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create endpoint");
      }

      const data = await response.json();

      // Redirect to the endpoint page
      router.push(`/hooks/${data.slug}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create a Webhook Endpoint
        </h1>
        <p className="mt-2 text-gray-600">
          Generate a unique URL to receive and inspect webhook payloads in
          real-time.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="My Webhook Endpoint"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            A friendly name to identify your endpoint
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-4 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="What is this endpoint for?"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            A brief description of what you're testing
          </p>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Duration
          </label>
          <div className="mt-1 relative">
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="block appearance-none w-full px-4 py-2 pr-10 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isPersistent}
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            How long the endpoint should be active
          </p>
        </div>


        {/* <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="persistent"
              type="checkbox"
              checked={isPersistent}
              onChange={(e) => setIsPersistent(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="persistent" className="font-medium text-gray-700">
              Make persistent{" "}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Pro plan
              </span>
            </label>
            <p className="text-gray-500">
              Endpoint won't expire and will be saved to your account
            </p>
          </div>
        </div> */}

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Endpoint"}
          </button>
        </div>
      </form>
    </div>
  );
}
