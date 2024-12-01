// // From client code activating service worker
// //
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker
//         .register("./worker.js")
//         .then((registration) => {
//             console.log("Service Worker registered:", registration);

//             // Send a message to the service worker
//             if (navigator.serviceWorker.controller) {
//                 navigator.serviceWorker.controller.postMessage(
//                     "Hello from Main Thread"
//                 );
//             }

//             // Listen for messages from the service worker
//             navigator.serviceWorker.addEventListener("message", (event) => {
//                 console.log("Message from Service Worker:", event.data);
//             });
//         })
//         .catch((error) =>
//             console.error("Service Worker registration failed:", error)
//         );
// } else {
//     console.error("Service Workers are not supported in this browser.");
// }

// //
// // These are the code inside the worker.ts
// //
// console.log("Running Service Worker");

// self.addEventListener("install", (event) => {
//     console.log("Service Worker installed");

//     // self.skipWaiting(); // Activate immediately after installation
// });

// self.addEventListener("activate", (event) => {
//     console.log("Service Worker activated");
// });

// self.addEventListener("message", (event) => {
//     console.log("Message from Main Thread:", event.data);

//     // Send a response back to the main thread
//     if (event.source) event.source.postMessage("Hello from Service Worker");
// });

// //
// // Read file from fs
// //

// // document.addEventListener("keydown", async (e) => {
// //     if (e.code == "KeyA") {
// //         try {
// //             const [fileHandle] = await window.showOpenFilePicker({
// //                 types: [
// //                     {
// //                         description: "Text Files",
// //                         accept: {
// //                             "text/plain": [".txt"],
// //                         },
// //                     },
// //                 ],
// //                 multiple: false, // Set to true for selecting multiple files
// //             });

// //             const file = await fileHandle.getFile();
// //             console.log(file.name, file.type, file.size);

// //             const reader = new FileReader();

// //             reader.onload = (event) => {
// //                 console.log(event.target!.result); // File contents as text
// //             };

// //             reader.onerror = () => {
// //                 console.error("File could not be read.");
// //             };

// //             reader.readAsText(file); // Read file as text
// //         } catch (e) {
// //             console.log(e);
// //         }
// //     }
// // });
