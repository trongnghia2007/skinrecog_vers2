window.addEventListener("DOMContentLoaded", (event) => {
    const uploadInput = document.getElementById("upload-input");
    const preview = document.getElementById("preview");
    const useButton = document.getElementById("use-button");

    let uploadedFilename = "";

    function handleImageUpload() {
        const file = uploadInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const image = new Image();
                image.src = e.target.result;
                image.style.width = "100%";
                image.style.height = "100%";
                image.style.objectFit = "contain";
                preview.innerHTML = "";
                preview.appendChild(image);
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleUseButtonClick() {
        const file = uploadInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("image", file);

            try {
                const response = await fetch("/save-image", {
                    method: "POST",
                    body: formData
                });
                const result = await response.json();
                uploadedFilename = result.filename;
                performSkinRecognition();
            } catch (error) {
                console.error("Error saving image:", error);
            }
        }
    }

    async function performSkinRecognition() {
        const formData = new FormData();
        formData.append("filename", uploadedFilename);

        try {
            const response = await fetch("/perform-skin-recognition", {
                method: "POST",
                body: formData
            });
            const segments = await response.json();
            displayResults(uploadedFilename, segments);
        } catch (error) {
            console.error("Error performing skin recognition:", error);
        }
    }

    function displayResults(filename, segments) {
        const result = document.querySelector(".result");
        result.classList.add("result"); 
        result.style.display = "flex";

        const resultContainer = document.querySelector(".container");
        resultContainer.classList.add("container"); 
    
        // Hiển thị ảnh mới nhất trong folder test
        const testImageDiv = document.createElement("div");
        testImageDiv.classList.add("frame");
    
        const testImg = new Image();
        testImg.src = `/images/${filename}`;
        testImg.classList.add("frame-img");
    
        testImageDiv.appendChild(testImg);
        resultContainer.appendChild(testImageDiv);
    
        // Hiển thị các ảnh phân đoạn trong folder segments
        segments.forEach(segment => {
            const segmentDiv = document.createElement("div");
            segmentDiv.classList.add("frame-sm");
    
            const segmentImg = new Image();
            segmentImg.src = `/segments/${filename.split('.')[0]}/${segment.image}`;
            segmentImg.classList.add("frame-sm-img");
    
            const info = document.createElement("p1");
            info.innerHTML = `${segment.prediction}`;
            info.classList.add("p1")
            const confidence = document.createElement("p2");
            confidence.innerHTML = `Chính xác: ${segment.confidence}%`;
            confidence.classList.add("p2")

            segmentDiv.appendChild(segmentImg);
            segmentDiv.appendChild(info);
            segmentDiv.appendChild(confidence);
            resultContainer.appendChild(segmentDiv);
        });
    }    

    uploadInput.addEventListener("change", handleImageUpload);
    useButton.addEventListener("click", handleUseButtonClick);
});
