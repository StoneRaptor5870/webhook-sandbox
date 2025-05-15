import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Debug webhooks</span>{" "}
              <span className="block text-indigo-600 xl:inline">
                the easy way
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Create temporary endpoints to test your webhooks in real-time.
              Inspect JSON payloads, headers, and more with our intuitive
              interface.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/create"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="#features"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for webhook testing
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              A powerful set of tools designed for developers to test and debug
              webhooks with ease.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Instant Endpoint Creation
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Generate a unique URL in seconds and start testing your
                  webhooks immediately.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Real-time Payload Viewer
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  See webhook payloads in real-time with a beautiful JSON
                  viewer. No need to refresh the page.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Request History
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  All requests are logged and can be viewed later. See headers,
                  body, and more.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    Replay Requests
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Copy cURL commands or replay requests to any URL for easy
                  testing and debugging.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase text-indigo-600">
              Pricing
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            <div className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
              <h3 className="text-lg font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">
                Perfect for quick tests and occasional use
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  $0
                </span>
                <span className="text-base font-medium text-gray-500">
                  /month
                </span>
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    1 endpoint at a time
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">24-hour history</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    Real-time updates
                  </p>
                </li>
              </ul>
              <div className="mt-18">
                <Link
                  href="/create"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Get started
                </Link>
              </div>
            </div>

            <div className="border border-indigo-200 rounded-lg shadow-sm p-6 bg-white relative">
              <div className="absolute top-0 right-0 -mt-3 mr-6 bg-indigo-600 rounded-full px-3 py-1 text-xs font-semibold text-white tracking-wide uppercase">
                Popular
              </div>
              <h3 className="text-lg font-medium text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">
                For teams and regular webhook testing
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  $4
                </span>
                <span className="text-base font-medium text-gray-500">
                  /month
                </span>
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    Unlimited endpoints
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">30-day history</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Team sharing</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    Email notifications
                  </p>
                </li>
              </ul>
              <div className="mt-8">
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Coming soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
