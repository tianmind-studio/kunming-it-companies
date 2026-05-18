const buttons = document.querySelectorAll("[data-copy-target]");

async function copyTemplate(event) {
  const button = event.currentTarget;
  const target = document.getElementById(button.dataset.copyTarget);
  if (!target) return;

  try {
    await navigator.clipboard.writeText(target.value);
    button.textContent = "已复制";
  } catch {
    target.select();
    document.execCommand("copy");
    button.textContent = "已复制";
  }

  window.setTimeout(() => {
    button.textContent = "复制";
  }, 1600);
}

for (const button of buttons) {
  button.addEventListener("click", copyTemplate);
}
