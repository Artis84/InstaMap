// Initialize the map
const myMap = L.map("map").setView([43.94340822071335, 4.822231528260277], 13);

// Add the tile layer
L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
}).addTo(myMap);

// Add a click event listener to the map
myMap.on("click", function (e) {
    // Get the coordinates of the clicked location
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Search for YouTube videos related to the city name
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&type=video&location=${lat},${lng}&locationRadius=1m&key=AIzaSyB5E4zHuceMvKNj7VHkPRyH-iCh9DGiuuM`;
    fetch(youtubeUrl)
        .then((response) => response.json())
        .then((data) => {
            // Get the video data from the YouTube API response
            const videos = data.items.map((item) => {
                return {
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    videoId: item.id.videoId,
                };
            });

            // Remove the previous video container if it exists
            const sideMenuNode = document.getElementById("side-menu") || undefined;
            if (sideMenuNode) {
                sideMenuNode.remove();
            }

            // Create a side menu with the videos
            const sideMenu = document.createElement("ul");
            sideMenu.id = "side-menu";
            videos.forEach((video) => {
                videoContainer = document.createElement("li");
                videoContainer.classList.add("video-container");

                const thumbnail = document.createElement("img");
                thumbnail.src = video.thumbnail;
                thumbnail.classList.add("thumbnail");
                videoContainer.appendChild(thumbnail);

                const title = document.createElement("div");
                title.textContent = decodeURIComponent(video.title);
                title.classList.add("title");
                videoContainer.appendChild(title);

                videoContainer.addEventListener("click", function () {
                    // Create a popup and display the YouTube video
                    const popupContent =
                        '<iframe src="https://www.youtube.com/embed/' +
                        video.videoId +
                        '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                    L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(myMap);
                });

                sideMenu.appendChild(videoContainer);
            });

            // Add the side menu to the page
            const menu = document.getElementById("menu");
            menu.appendChild(sideMenu);
        });
});
