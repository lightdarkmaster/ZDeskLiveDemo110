function loadZohoDeskASAP() {
    // Prevent duplicate loading
    if (document.getElementById("zohodeskasapscript")) {
        return;
    }

    const d = document;

    // Initialize the ready callback
    window.ZohoDeskAsapReady = function (callback) {
        const queue = window.ZohoDeskAsap__asyncalls =
            window.ZohoDeskAsap__asyncalls || [];

        if (window.ZohoDeskAsapReadyStatus) {
            if (callback) queue.push(callback);

            queue.forEach(fn => {
                if (typeof fn === "function") {
                    fn();
                }
            });

            window.ZohoDeskAsap__asyncalls = null; 
        } else if (callback) {
            queue.push(callback);
        }
    };

    // Create the ASAP widget script
    const script = d.createElement("script");
    script.type = "text/javascript";
    script.id = "zohodeskasapscript";
    script.defer = true;

    

    script.src = "https://desk.zoho.com/portal/api/web/asapApp/1419133000000473326?orgId=931771208";

    // Insert before the first script tag (same as the original snippet)
    const firstScript = d.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
}

// Load the Zoho Desk ASAP widget
loadZohoDeskASAP();