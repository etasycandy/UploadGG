// Add document
let addCompanyForm = document.querySelector(".add-customer-form");

document.querySelector("#btn-add-customer").onclick = () => {
  addCompanyForm.classList.toggle("active");
};

document.querySelector("#close-add-customer-btn").onclick = () => {
  addCompanyForm.classList.remove("active");
};

/**
 * Delete document
 */
let quesDel = document.querySelector(".quesDel");
let id = "";

document.querySelectorAll(".btn-del-document").forEach((button) => {
  button.onclick = (e) => {
    id = e.target.dataset.id;
    quesDel.classList.toggle("active");
  };
});

document.querySelector("#yes").onclick = () => {
  fetch("/document/delete", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idDoc: id }),
  })
    .then((response) => response.json())
    .then((data) => {
      location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

document.querySelector("#no").onclick = () => {
  quesDel.classList.remove("active");
};
