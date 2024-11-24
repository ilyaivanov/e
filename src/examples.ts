// From client code activating service worker
//
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("./worker.js")
        .then((registration) => {
            console.log("Service Worker registered:", registration);

            // Send a message to the service worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage(
                    "Hello from Main Thread"
                );
            }

            // Listen for messages from the service worker
            navigator.serviceWorker.addEventListener("message", (event) => {
                console.log("Message from Service Worker:", event.data);
            });
        })
        .catch((error) =>
            console.error("Service Worker registration failed:", error)
        );
} else {
    console.error("Service Workers are not supported in this browser.");
}

//
// These are the code inside the worker.ts
//
console.log("Running Service Worker");

self.addEventListener("install", (event) => {
    console.log("Service Worker installed");

    // self.skipWaiting(); // Activate immediately after installation
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activated");
});

self.addEventListener("message", (event) => {
    console.log("Message from Main Thread:", event.data);

    // Send a response back to the main thread
    if (event.source) event.source.postMessage("Hello from Service Worker");
});
