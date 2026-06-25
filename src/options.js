const input = document.getElementById("github-token");
const saveButton = document.getElementById("save-token");
const status = document.getElementById("status");

chrome.storage.sync.get({ githubToken: "" }).then(({ githubToken }) => {
  input.value = githubToken;
});

saveButton.addEventListener("click", async () => {
  await chrome.storage.sync.set({ githubToken: input.value.trim() });
  status.textContent = "Saved";
  setTimeout(() => {
    status.textContent = "";
  }, 1800);
});
