console.log("Script loaded successfully!");

// My form
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("myForm")
    .addEventListener("use-button", function (e) {
      e.preventDefault(); // Prevent form submission

      var checkboxes = document.querySelectorAll('input[type="checkbox"]');
      var selectedChoicesSet = new Set();

      checkboxes.forEach(function (checkbox) {
        if (checkbox.value === "") {
          return; // Bỏ qua checkbox có giá trị rỗng
        }

        if (checkbox.value) {
          selectedChoicesSet.add(checkbox.value);
        }
      });

      var selectedChoicesSet = Array.from(selectedChoicesSet); // Convert set to array
    });

  // Process image and result
  // Get DOM elements
  const uploadInput = document.getElementById("upload-input");
  const preview = document.getElementById("preview");
  const myForm = document.getElementById("myForm");
  const actionButtons = document.getElementById("action-buttons");
  const cancelButton = document.getElementById("cancel-button");
  const useButton = document.getElementById("use-button");
  const outputSection = document.getElementById("output");

  // Function to handle image upload
  function handleImageUpload() {
    const file = uploadInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const image = document.createElement("img");
        image.src = e.target.result;
        image.style.maxWidth = "100%";
        image.style.maxHeight = "100%";
        preview.innerHTML = "";
        preview.appendChild(image);
        actionButtons.style.display = "block";
        outputSection.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  }

  // Event listener for file input change
  uploadInput.addEventListener("change", handleImageUpload);

  // Function to reset the image preview
  function resetImagePreview() {
    preview.innerHTML = "";
    actionButtons.style.display = "none";
    uploadInput.value = "";
    outputSection.style.display = "none"; // Ẩn phần kết quả
  }

  // Function to perform SLIC and skin recognition
  async function performSkinRecognition(data) {
    const response = await fetch("/perform-skin-recognition", {
      method: "POST",
      body: data,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Result:", result); // Debug log

      try {
        // Remove loading animation
        document.querySelector("#loading-overlay").style.display = "none";
        document.body.classList.remove("loading");

        // Remove upload button
        document.querySelector("button#upload-input").style.display = "none";

        // Process the result and display it
        outputSection.style.display = "block"; // Display the result section

        outputSection.innerHTML = ""; // Clear previous results

        // Create and append the heading
        const heading = document.createElement("h1");
        heading.style.fontSize = "40px";
        heading.style.textAlign = "center";
        heading.textContent = "Kết Quả";
        outputSection.appendChild(heading);

        // Display images and results
        result.forEach((item) => {
          const containerDiv = document.createElement("div");
          containerDiv.style.display = "flex";
          containerDiv.style.flexWrap = "wrap";
          containerDiv.style.justifyContent = "space-evenly";
          containerDiv.style.border = "2px solid black";
          containerDiv.style.margin = "10px 0";

          const img = document.createElement("img");
          img.src = `/images/${item.segment_data}.jpg`;
          console.log(img.src);
          img.style.width = "100%";
          img.style.border = "1px solid black";

          const predictionP = document.createElement("p");
          predictionP.style.marginTop = "1rem";
          predictionP.style.marginBottom = "0px";
          predictionP.style.fontSize = "1.25rem";
          predictionP.textContent = item.prediction;

          const confidenceP = document.createElement("p");
          confidenceP.style.marginTop = "0px";
          confidenceP.style.fontSize = "1.25rem";
          confidenceP.textContent = `chính xác: ${item.confidence}%`;

          containerDiv.appendChild(img);
          containerDiv.appendChild(predictionP);
          containerDiv.appendChild(confidenceP);

          outputSection.appendChild(containerDiv);
        });

        // Replace preview image with SLIC result image
        const slicImage = document.createElement("img");
        slicImage.src = "/images/.superpixels.jpg";
        slicImage.style.maxWidth = "100%";
        slicImage.style.maxHeight = "100%";
        preview.innerHTML = "";
        preview.appendChild(slicImage);
      } catch (error) {
        console.error(error);
        outputSection.style.display = "block"; // Display the result section
        outputSection.innerHTML = `<h1 style="font-size: 60px">Kết Quả</h1><p>${result}</p>`;
      }
    } else {
      console.error("Error performing skin recognition");
    }
  }

  // Listen to the "change" event on the file input and call the handleImageUpload function
  uploadInput.addEventListener("change", handleImageUpload);

  // Listen to the "click" event on the use button and call the performSkinRecognition function
  useButton.addEventListener("click", async () => {
    // getting the selected option
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    var selectedChoicesSet = new Set();

    checkboxes.forEach(function (checkbox) {
      if (checkbox.value === "") {
        return; // Bỏ qua checkbox có giá trị rỗng
      }

      if (checkbox.checked) {
        selectedChoicesSet.add(checkbox.value);
      }
    });
    selectedChoicesSet.add("khỏe mạnh");

    var selectedChoices = Array.from(selectedChoicesSet); // Convert set to array

    // document.getElementById('result').textContent = "Selected choices: " + selectedChoices.join(", ");

    // create a formData object
    const formData = new FormData();

    // add the image and the selections to the form data
    const file = uploadInput.files[0];
    if (file) {
      // add image
      formData.append("image", file);
      // add selections
      selectedChoices.forEach((e) => {
        formData.append("sel[]", e);
      });
      // formData.append("sel", selectedChoices);
      alert("Vui lòng chờ \nQuá trình này có thể mất nhiều thời gian");
      // start loading animation
      document.querySelector("#loading-overlay").style.display = "flex";
      document.body.classList.add("loading");
      await performSkinRecognition(formData);
    }
  });
});

// Chat box
/* 
function openChat() {
    alert('Chat icon clicked!');
    // Thay thế alert bằng hành động thực tế, ví dụ: mở cửa sổ chat
}
    */

document.addEventListener("DOMContentLoaded", function () {
  const chatCircle = document.getElementById("chat-icon");
  const chatBox = document.getElementById("chat-box");
  const closeButton = document.getElementById("close-button");
  const chatContent = document.getElementById("chat-content");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  let isOpen = false;

  function toggleChatBox() {
    isOpen = !isOpen;
    chatBox.style.display = isOpen ? "block" : "none";
  }

  function closeChatBox() {
    isOpen = false;
    chatBox.style.display = "none";
  }

  function appendMessage(sender, message, isTitle = false) {
    const messageElement = document.createElement("div");

    // Split the message by new lines and add <br/> tags
    const messageParts = message.split("\n");
    const formattedMessage = messageParts.join("<br/>");

    if (isTitle) {
      messageElement.innerHTML = `<strong style="color: #e9a084">${sender}:</strong><br/>${message}`;
    } else {
      // Append a line break at the end of the formatted message
      messageElement.innerHTML = `<strong>${sender}:</strong> ${formattedMessage}<br/>`;
    }

    chatContent.appendChild(messageElement);
    chatContent.scrollTop = chatContent.scrollHeight;
  }

  function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage !== "") {
      // Thay vì sử dụng formattedUserMessage, hãy truyền userMessage trực tiếp
      appendMessage("Bạn", userMessage);

      // Call your backend API to get the bot's response
      // Example: You can use the Fetch API or an AJAX library
      // Replace the URL with your actual backend endpoint
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/askGPT");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log(xhr.status);
          // console.log(xhr.responseText);

          // Append chatbot's response with a line break
          appendMessage("Tư vấn", JSON.parse(xhr.responseText).content + "\n");
        }
      };

      xhr.send(JSON.stringify({ message: userMessage }));

      userInput.value = "";
    }
  }

  chatCircle.addEventListener("click", toggleChatBox);
  closeButton.addEventListener("click", closeChatBox);
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
});
