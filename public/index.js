// Initialize the map
const myMap = L.map("map").setView([43.94340822071335, 4.822231528260277], 13);

// Add the tile layer
L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
}).addTo(myMap);

// Add a click event listener to the map
myMap.on("click", async (e) => {
    // Get the coordinates of the clicked location
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // show the click effect
    const clickCircle = document.getElementById("click-circle");
    const circleSize = 50; // adjust as necessary
    clickCircle.style.top = e.originalEvent.clientY - circleSize / 2 + "px";
    clickCircle.style.left = e.originalEvent.clientX - circleSize / 2 + "px";
    clickCircle.style.display = "block";
    setTimeout(function () {
        clickCircle.style.display = "none";
    }, 500);

    const statusNode = document.getElementById("status");
    const sideMenuNode = document.getElementById("side-menu") || undefined;
    const overlayNode = document.querySelector(".overlay") || undefined;
    try {
        // Search for YouTube videos related to the city name
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&type=video&location=${lat},${lng}&locationRadius=1m&key=AIzaSyC7-RXnQqPhr4iBVe8iyh-2j4qiOBITQfY`;

        const response = await fetch(youtubeUrl);
        const data = await response.json();

        // Remove the previous video container if it exists
        if (sideMenuNode) sideMenuNode.remove();
        if (overlayNode) overlayNode.remove();

        if (statusNode.textContent) statusNode.style.display = "none";

        if (Object.keys(data.items).length == 0) throw "No results found";

        // if (!data.length) throw new Error("No results found");
        const videos = data.items.map((item) => {
            const date = new Date(item.snippet.publishedAt);
            const year = date.getFullYear();
            return {
                title: item.snippet.title + " (" + year + ")",
                thumbnail: item.snippet.thumbnails.medium.url,
                videoId: item.id.videoId,
            };
        });

        // Create a side menu
        const overlay = document.createElement("div");
        overlay.className = "overlay";
        const sideMenu = document.createElement("ul");
        sideMenu.id = "side-menu";

        videos.forEach((video) => {
            videoContainer = document.createElement("li");
            videoContainer.classList.add("video-container");

            const thumbnail = document.createElement("img");
            thumbnail.src = video.thumbnail;
            thumbnail.classList.add("thumbnail");
            videoContainer.appendChild(thumbnail);

            const titleContainer = document.createElement("div");
            const title = document.createElement("p");
            title.textContent = video.title;
            titleContainer.classList.add("title");
            titleContainer.appendChild(title);
            videoContainer.appendChild(titleContainer);

            videoContainer.addEventListener("click", function () {
                // Create a popup and display the YouTube video
                const popupContent =
                    '<iframe src="https://www.youtube.com/embed/' +
                    video.videoId +
                    '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(myMap);
            });

            // Populate the side menu with videos
            sideMenu.appendChild(videoContainer);
        });

        const menu = document.getElementById("menu");
        menu.style.display = "block";
        menu.appendChild(sideMenu);
        const sideMenuHeight = document.getElementById("side-menu");

        // const hiddenContentHeight = sideMenuHeight.scrollHeight - (sideMenuHeight.scrollHeight - menu.clientHeight);
        if (sideMenuHeight.scrollHeight - 40 > menu.clientHeight) {
            menu.appendChild(overlay);
            console.log("Overflow detected! " + "\nscrollHeight: " + sideMenuHeight.scrollHeight + "\nclientHeight: " + menu.clientHeight);
        } else {
            console.log("No Overflow detected! " + "\nscrollHeight: " + sideMenuHeight.scrollHeight + "\nclientHeight: " + menu.clientHeight);
        }
    } catch (error) {
        statusNode.style.display = "block";
        error === "No results found" ? (statusNode.innerHTML = "No results found 😕") : (statusNode.innerHTML = "An error occured 😟");
        console.error(error);
    }
});
