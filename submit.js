const buttons = document.querySelectorAll("[data-copy-target]");
const leadForm = document.getElementById("leadForm");
const formStatus = document.getElementById("formStatus");
const primaryHost = "kunming.tianmind.com";
const leadApiEndpoint = window.location.hostname === primaryHost
  ? "/api/leads"
  : `https://${primaryHost}/api/leads`;

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

function setStatus(message, type = "neutral") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.state = type;
}

function trimFields(payload) {
  const cleaned = {};
  for (const [key, value] of Object.entries(payload)) {
    cleaned[key] = typeof value === "string" ? value.trim() : value;
  }
  return cleaned;
}

function buildPayload(form) {
  const data = new FormData(form);
  return trimFields({
    lead_type: data.get("lead_type"),
    title: data.get("title"),
    city: data.get("city"),
    district: data.get("district"),
    category: data.get("category"),
    source_url: data.get("source_url"),
    reason: data.get("reason"),
    relationship: data.get("relationship"),
    contact: data.get("contact"),
    notes: data.get("notes"),
    website: data.get("website")
  });
}

function isValidPublicUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function submitLead(event) {
  event.preventDefault();
  if (!leadForm) return;

  const submitButton = leadForm.querySelector("button[type='submit']");
  const payload = buildPayload(leadForm);

  if (!isValidPublicUrl(payload.source_url)) {
    setStatus("请填写可以公开复核的 http 或 https 来源链接。", "error");
    return;
  }

  submitButton.disabled = true;
  setStatus("正在提交，维护者会先复核再写入数据。", "neutral");

  try {
    const response = await fetch(leadApiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "提交失败");
    }

    leadForm.reset();
    leadForm.elements.city.value = "昆明";
    setStatus(`已收到，编号 ${result.id}。维护者会按公开来源复核。`, "success");
  } catch (error) {
    setStatus(`表单暂时不可用：${error.message}。可以复制下方模板后通过微信提交。`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

if (leadForm) {
  leadForm.addEventListener("submit", submitLead);
}
