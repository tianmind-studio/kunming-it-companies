const buttons = document.querySelectorAll("[data-copy-target]");
const leadForm = document.getElementById("leadForm");
const formStatus = document.getElementById("formStatus");
let submitting = false;
const primaryHost = "kunming.tianmind.com";
const leadApiEndpoint = window.location.hostname === primaryHost
  ? "/api/leads"
  : `https://${primaryHost}/api/leads`;

async function copyTemplate(event) {
  const button = event.currentTarget;
  const target = document.getElementById(button.dataset.copyTarget);
  if (!target) return;

  let copied = false;
  try {
    await navigator.clipboard.writeText(target.value);
    copied = true;
  } catch {
    target.focus();
    target.select();
    try { copied = document.execCommand("copy"); } catch { /* Selection remains available. */ }
  }
  button.textContent = copied ? "已复制" : "请长按复制已选文字";

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
  if (!leadForm || submitting || !leadForm.reportValidity()) return;

  const submitButton = leadForm.querySelector("button[type='submit']");
  const payload = buildPayload(leadForm);

  if (!isValidPublicUrl(payload.source_url)) {
    setStatus("请填写可以公开复核的 http 或 https 来源链接。", "error");
    return;
  }

  submitting = true;
  submitButton.disabled = true;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  setStatus("正在提交，维护者会先复核再写入数据。", "neutral");

  try {
    const response = await fetch(leadApiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(typeof result?.error === "string" ? result.error : "提交失败");
    }

    if (result?.ok !== true || typeof result.id !== "string" || !/^KMR-[A-Z0-9-]+$/.test(result.id)) {
      throw new Error("未取得有效回执，内容已保留，请先向维护者确认是否收到，避免重复提交");
    }

    leadForm.reset();
    leadForm.elements.city.value = "昆明";
    setStatus(`已收到，编号 ${result.id}。维护者会按公开来源复核。`, "success");
  } catch (error) {
    const message = error.name === "AbortError"
      ? "请求超时，尚未确认是否收到。内容已保留，请先向维护者确认，避免重复提交"
      : error.message;
    setStatus(`表单暂时不可用：${message}。也可复制下方模板联系维护者。`, "error");
  } finally {
    window.clearTimeout(timeout);
    submitting = false;
    submitButton.disabled = false;
  }
}

if (leadForm) {
  const params = new URLSearchParams(window.location.search);
  const company = params.get("company");
  if (company) leadForm.elements.title.value = company.slice(0, 120);
  if (["update", "correction"].includes(params.get("type"))) {
    leadForm.elements.lead_type.value = "correction";
  }
  leadForm.addEventListener("submit", submitLead);
}
