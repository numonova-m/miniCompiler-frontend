(function () {
  const API_BASE = "http://localhost:4001";
  document.getElementById("apiBase").textContent =
    API_BASE || "same origin (/)";

  const exprInput = document.getElementById("expr");
  const btnCompile = document.getElementById("btnCompile");
  const btnEval = document.getElementById("btnEval");
  const btnClear = document.getElementById("btnClear");
  const feedback = document.getElementById("feedback");
  const instructionsList = document.getElementById("instructionsList");
  const mathResult = document.getElementById("mathResult");
  const resultRaw = document.getElementById("resultRaw");

  function setLoading(on, message = "Kutilmoqda...") {
    feedback.textContent = on ? message : "";
    btnCompile.disabled = on;
    btnEval.disabled = on;
  }

  function showError(msg) {
    feedback.innerHTML = '<div style="color:#ffb4b4">' + msg + "</div>";
  }

  function clearOutputs() {
    instructionsList.innerHTML = "";
    mathResult.textContent = "—";
    resultRaw.textContent = "";
    feedback.innerHTML = '<div class="muted">Natijalar bu yerda chiqadi.</div>';
  }

  btnClear.addEventListener("click", () => {
    exprInput.value = "";
    clearOutputs();
  });

  btnCompile.addEventListener("click", async () => {
    const expr = exprInput.value.trim();
    if (!expr) {
      showError("Iltimos, ifodani kiriting");
      return;
    }

    setLoading(true, "Instruksiyalar olinmoqda...");
    try {
      const res = await fetch((API_BASE || "") + "/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expr }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        showError(data?.message || "Server xatosi");
        return;
      }

      if (Array.isArray(data.instructions)) {
        instructionsList.innerHTML = "";
        data.instructions.forEach((ins, i) => {
          const li = document.createElement("li");
          li.innerHTML = `<span>${i + 1}. ${ins}</span><strong>${
            i === data.instructions.length - 1 ? "" : ""
          }</strong>`;
          instructionsList.appendChild(li);
        });
        feedback.innerHTML = `<div class="muted">Instruksiyalar muvaffaqiyatli olindi. Oxirgi qiymat: <strong>${String(
          data.result
        )}</strong></div>`;
        mathResult.textContent =
          typeof data.result === "number" ? data.result : String(data.result);
        resultRaw.textContent = "compile() tomonidan olingan natija";
      } else {
        showError("Instruksiyalar topilmadi yoki noto'g'ri format.");
      }
    } catch (err) {
      setLoading(false);
      showError("Tarmoq yoki server bilan muammo: " + (err.message || err));
    }
  });

  btnEval.addEventListener("click", async () => {
    const expr = exprInput.value.trim();
    if (!expr) {
      showError("Iltimos, ifodani kiriting");
      return;
    }

    setLoading(true, "Hisoblanmoqda...");
    try {
      const res = await fetch((API_BASE || "") + "/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expr }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        showError(data?.message || "Server xatosi");
        return;
      }

      if (data?.result !== undefined) {
        mathResult.textContent =
          typeof data.result === "number" ? data.result : String(data.result);
        resultRaw.textContent = "evaluate() natijasi";
        feedback.innerHTML = `<div class="muted">Hisoblash yakunlandi. Natija: <strong>${String(
          data.result
        )}</strong></div>`;
      } else {
        showError("Server noto'g'ri javob berdi.");
      }
    } catch (err) {
      setLoading(false);
      showError("Tarmoq yoki server bilan muammo: " + (err.message || err));
    }
  });

  // Quick example: Enter key = evaluate
  exprInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      btnEval.click();
    }
  });

  // init
  clearOutputs();
})();
