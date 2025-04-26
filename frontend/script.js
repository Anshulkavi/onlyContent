document.addEventListener("DOMContentLoaded", () => {
    console.log("CareerCraft script loaded successfully!");
  
    // --- Mobile menu toggle ---
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links");
    const navButtons = document.querySelector(".nav-buttons");
  
    mobileMenuBtn?.addEventListener("click", () => {
      const show = navLinks.style.display === "flex";
      navLinks.style.display = show ? "none" : "flex";
      navButtons.style.display = show ? "none" : "flex";
    });
  
    // --- Image slider ---
    const sliderContainer = document.querySelector(".slider-container");
    const images = sliderContainer?.querySelectorAll("img") || [];
    let currentIndex = 0;
  
    function slideImages() {
      if (images.length > 0) {
        currentIndex = (currentIndex + 1) % images.length;
        sliderContainer.style.transform = `translateX(-${currentIndex * 320}px)`;
      }
    }
  
    if (images.length > 0) setInterval(slideImages, 3000);
  
    // --- Animate content on scroll ---
    const contentItems = document.querySelectorAll(".content-item, .feature-item");
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);
  
    contentItems.forEach((item) => observer.observe(item));
  
    // --- Resume Upload ---
    const resumeUploadForm = document.getElementById("resumeUploadForm");
    const resumeFile = document.getElementById("resumeFile");
    const fileLabel = document.querySelector(".file-input-label span");
    const uploadStatus = document.getElementById("uploadStatus");
    const jobCardsContainer = document.getElementById("jobCards");
    const matchedCompaniesDiv = document.getElementById("matchedCompanies");
  
    resumeFile?.addEventListener("change", () => {
      fileLabel.textContent = resumeFile.files.length > 0 ? resumeFile.files[0].name : "Choose a file";
    });
  
    resumeUploadForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const file = resumeFile.files[0];
      if (!file) {
        uploadStatus.textContent = "❗ Please select a file to upload.";
        return;
      }
  
      const formData = new FormData();
      formData.append("resume", file);
      uploadStatus.innerHTML = "⏳ Uploading and analyzing resume...";
      jobCardsContainer.innerHTML = "";
      matchedCompaniesDiv.style.display = "none";
  
      try {
        const response = await fetch("http://127.0.0.1:8000/api/upload_resume/", {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Something went wrong.");
        }
  
        const { extracted, matches } = data;
        const { name, email, phone, skills, experience } = extracted;
  
        uploadStatus.innerHTML = `
          ✅ <strong>${name}</strong>'s resume processed.<br>
          📧 <strong>Email:</strong> ${email}<br>
          📞 <strong>Phone:</strong> ${phone || "N/A"}<br>
          💼 <strong>Experience:</strong> ${experience || "N/A"}<br>
          🛠️ <strong>Skills:</strong> ${skills.join(", ")}
        `;
  
        if (matches.length > 0) {
          matches.forEach((job) => {
            const card = document.createElement("div");
            card.classList.add("job-card");
  
            card.innerHTML = `
              <h4>${job.title}</h4>
              <p><strong>Company:</strong> ${job.company_name || "Unknown"}</p>
              <p><strong>Location:</strong> ${job.location || "N/A"}</p>
              <p><strong>Salary:</strong> ${job.salary || "N/A"}</p>
              <a href="${job.url}" target="_blank" class="apply-link">Apply Now</a>
            `;
  
            jobCardsContainer.appendChild(card);
          });
          matchedCompaniesDiv.style.display = "block";
        } else {
          jobCardsContainer.innerHTML = "<p>No matching jobs found.</p>";
          matchedCompaniesDiv.style.display = "block";
        }
  
        resumeUploadForm.reset();
        fileLabel.textContent = "Choose a file";
  
      } catch (error) {
        console.error("❌ Upload error:", error);
        uploadStatus.textContent = `❌ Upload error: ${error.message}`;
      }
    });
  });
  