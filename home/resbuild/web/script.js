document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.addEventListener("click", function () {
      const companyName = document.getElementById("company-name").value;
      const positionName = document.getElementById("position-name").value;
      const location = document.getElementById("location").value;
      const selectedTemplate = document.getElementById("template-select").value

      const formData = {
        selectedTemplate, 
        companyName,
        positionName,
        location,
        mechJob: document.querySelector('#mech-job').checked, 
        skill_flags: [
          document.querySelector('#skill-0').checked, 
          document.querySelector('#skill-1').checked, 
          document.querySelector('#skill-2').checked, 
          document.querySelector('#skill-3').checked, 
          document.querySelector('#skill-4').checked, 
          document.querySelector('#skill-5').checked, 
          document.querySelector('#skill-6').checked, 
          document.querySelector('#skill-7').checked, 
          document.querySelector('#skill-8').checked, 
          document.querySelector('#skill-9').checked, 
          document.querySelector('#skill-10').checked, 
        ],
      };
      fetch("/form",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )
      .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "generated_file.pdf"; // Set the filename you want
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error(error);
        alert("Error: " + error.message);
    });
    });
  });