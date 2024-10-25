//code for push notification

let interval;
let notification; // Declare `notification` globally to avoid issues with reassignment

// Request permission for notifications
Notification.requestPermission().then(perm => {
  if (perm === "granted") {
    try {
      notification = new Notification("Example notification", {
        body: "Welcome to the website",
        data: { hello: "world" },
        tag: "Welcome Message", // Use a unique tag to avoid stacking
        icon: "/public/images/favicon.jpg",
      });

      notification.addEventListener("error", e => {
        console.error("Notification error event:", e);
      });
    } catch (e) {
      console.error("Failed to create notification: " + e.message);
    }
  } else {
    console.warn("Notification permissions were denied.");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const leaveDate = new Date();

    // Use a throttle mechanism to limit notifications to every 5 seconds (or another reasonable time)
    interval = setInterval(() => {
      try {
        new Notification("Come back please", {
          body: `You have been gone for ${Math.round((new Date() - leaveDate) / 1000)} seconds`,
          tag: "Come Back", // Use a tag to ensure notifications don't stack
          renotify: true,   // Ensure only the most recent notification shows up
        });
      } catch (e) {
        clearInterval(interval); // Stop the interval if there is an error
        console.error("Notification error during interval: " + e);
      }
    }, 5000); // Notify every 5 seconds to avoid excessive notifications
  } else {
    // Stop sending notifications when the page is visible
    if (interval) clearInterval(interval);

    // Close the "Welcome" notification if it's still active
    if (notification) notification.close();
  }
});
