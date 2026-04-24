document.getElementById("yr").textContent = new Date().getFullYear();

    const KEY = "sgt_v2";

    function getStudents() { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    function saveStudents(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

    function calcAvg(s) {
      return ((+s.math + +s.english + +s.science + +s.ict) / 4).toFixed(1);
    }

    function letterGrade(avg) {
      if (avg >= 80) return "A";
      if (avg >= 65) return "B";
      if (avg >= 50) return "C";
      if (avg >= 40) return "D";
      return "F";
    }

    function pillClass(v) {
      v = +v;
      if (v >= 80) return "pill pill-green";
      if (v >= 65) return "pill pill-blue";
      if (v >= 50) return "pill pill-yellow";
      return "pill pill-red";
    }

    function avgColorStyle(a) {
      if (a >= 80) return "color:var(--green)";
      if (a >= 65) return "color:var(--accent)";
      if (a >= 50) return "color:var(--yellow)";
      return "color:var(--red)";
    }

    function progColor(v) {
      if (v >= 80) return "var(--green)";
      if (v >= 65) return "var(--accent)";
      if (v >= 50) return "var(--yellow)";
      return "var(--red)";
    }

    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

    function esc(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    function showToast(msg, type = "success") {
      const t = document.getElementById("toast");
      t.textContent = msg;
      t.className = `toast t-${type} show`;
      setTimeout(() => t.className = "toast", 2800);
    }

    function switchTab(name) {
      document.querySelectorAll(".tab").forEach((b,i) => {
        b.classList.toggle("active", ["records","analytics"][i] === name);
      });
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById("tab-" + name).classList.add("active");
      if (name === "analytics") renderAnalytics();
    }

    function updateStats() {
      const list = getStudents();
      const n    = list.length;
      document.getElementById("stat-total").textContent = n;
      if (n === 0) {
        document.getElementById("stat-avg").textContent  = "—";
        document.getElementById("stat-pass").textContent = "0";
        document.getElementById("stat-fail").textContent = "0";
        document.getElementById("stat-top").textContent  = "—";
        return;
      }
      const avgs  = list.map(s => parseFloat(calcAvg(s)));
      const cAvg  = (avgs.reduce((a,b) => a+b, 0) / n).toFixed(1);
      const pass  = avgs.filter(a => a >= 40).length;
      const top   = Math.max(...avgs).toFixed(1);
      document.getElementById("stat-avg").textContent  = cAvg;
      document.getElementById("stat-pass").textContent = pass;
      document.getElementById("stat-fail").textContent = n - pass;
      document.getElementById("stat-top").textContent  = top;
    }

    function renderTable() {
      const q       = document.getElementById("search").value.toLowerCase();
      const gFilter = document.getElementById("filter-grade").value;
      const sortBy  = document.getElementById("sort-by").value;
      let list      = getStudents();

      if (q) list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.sid.toLowerCase().includes(q)  ||
        (s.section||"").toLowerCase().includes(q)
      );

      if (gFilter) list = list.filter(s => letterGrade(parseFloat(calcAvg(s))) === gFilter);

      if (sortBy === "name")     list.sort((a,b) => a.name.localeCompare(b.name));
      if (sortBy === "avg-desc") list.sort((a,b) => parseFloat(calcAvg(b)) - parseFloat(calcAvg(a)));
      if (sortBy === "avg-asc")  list.sort((a,b) => parseFloat(calcAvg(a)) - parseFloat(calcAvg(b)));

      const tbody = document.getElementById("table-body");
      const empty = document.getElementById("empty-state");
      const foot  = document.getElementById("table-footer");

      if (list.length === 0) {
        tbody.innerHTML     = "";
        empty.style.display = "block";
        foot.style.display  = "none";
      } else {
        empty.style.display = "none";
        foot.style.display  = "flex";
        document.getElementById("showing-count").textContent = list.length;
        document.getElementById("total-count").textContent   = getStudents().length;

        tbody.innerHTML = list.map((s, i) => {
          const a    = parseFloat(calcAvg(s));
          const g    = letterGrade(a);
          const pass = a >= 40;
          const pct  = Math.round(a);
          return `<tr>
            <td style="color:var(--muted);font-size:0.78rem;">${i+1}</td>
            <td>
              <div class="s-name">${esc(s.name)}</div>
              <div class="s-id">${esc(s.sid)}</div>
            </td>
            <td style="color:var(--muted);font-size:0.82rem;">${esc(s.section||"—")}</td>
            <td><span class="${pillClass(s.math)}">${s.math}</span></td>
            <td><span class="${pillClass(s.english)}">${s.english}</span></td>
            <td><span class="${pillClass(s.science)}">${s.science}</span></td>
            <td><span class="${pillClass(s.ict)}">${s.ict}</span></td>
            <td>
              <span class="avg-val" style="${avgColorStyle(a)}">${a}</span>
              <span class="prog-wrap"><span class="prog-fill" style="width:${pct}%;background:${progColor(a)}"></span></span>
            </td>
            <td><span class="${pillClass(a)}">${g}</span></td>
            <td><span class="pill ${pass ? 'pill-green' : 'pill-red'}">${pass ? 'Pass' : 'Fail'}</span></td>
            <td>
              <div class="row-actions">
                <button class="act-btn"     onclick="openViewModal('${s.id}')">View</button>
                <button class="act-btn"     onclick="openEditModal('${s.id}')">Edit</button>
                <button class="act-btn del" onclick="openDeleteModal('${s.id}')">Delete</button>
              </div>
            </td>
          </tr>`;
        }).join("");
      }
      updateStats();
    }

    function saveStudent() {
      const name    = document.getElementById("inp-name").value.trim();
      const sid     = document.getElementById("inp-id").value.trim();
      const section = document.getElementById("inp-section").value.trim();
      const math    = document.getElementById("inp-math").value;
      const eng     = document.getElementById("inp-eng").value;
      const sci     = document.getElementById("inp-sci").value;
      const ict     = document.getElementById("inp-ict").value;

      if (!name || !sid || math==="" || eng==="" || sci==="" || ict==="") {
        showToast("Please fill in all required fields.", "error"); return;
      }
      if ([+math,+eng,+sci,+ict].some(g => g < 0 || g > 100)) {
        showToast("Grades must be between 0 and 100.", "error"); return;
      }
      const list = getStudents();
      if (list.find(s => s.sid === sid)) {
        showToast("Student ID already exists.", "error"); return;
      }
      list.push({ id: uid(), name, sid, section, math:+math, english:+eng, science:+sci, ict:+ict });
      saveStudents(list);
      clearForm();
      renderTable();
      showToast(`${name} added successfully.`);
    }

    function clearForm() {
      ["inp-name","inp-id","inp-section","inp-math","inp-eng","inp-sci","inp-ict"]
        .forEach(id => document.getElementById(id).value = "");
      document.getElementById("form-title").textContent = "Add Student";
    }

    function cancelEdit() {
      clearForm();
      document.getElementById("cancel-btn").style.display = "none";
    }

    function openViewModal(id) {
      const s = getStudents().find(x => x.id === id);
      if (!s) return;
      const a = parseFloat(calcAvg(s));
      const g = letterGrade(a);
      document.getElementById("view-content").innerHTML = `
        <div style="display:grid;gap:10px;font-size:0.86rem;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">Name</span><span style="font-weight:600">${esc(s.name)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">Student ID</span><span style="font-weight:600">${esc(s.sid)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">Section</span><span style="font-weight:600">${esc(s.section||"—")}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">Math</span><span class="${pillClass(s.math)}">${s.math}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">English</span><span class="${pillClass(s.english)}">${s.english}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">Science</span><span class="${pillClass(s.science)}">${s.science}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">ICT</span><span class="${pillClass(s.ict)}">${s.ict}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-weight:500">Average</span><span class="avg-val" style="${avgColorStyle(a)}">${a}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:var(--muted);font-weight:500">Grade / Status</span><div style="display:flex;gap:6px"><span class="${pillClass(a)}">${g}</span><span class="pill ${a>=40?'pill-green':'pill-red'}">${a>=40?'Pass':'Fail'}</span></div></div>
        </div>`;
      document.getElementById("view-modal").classList.add("open");
    }

    let editingId = null;

    function openEditModal(id) {
      const s = getStudents().find(x => x.id === id);
      if (!s) return;
      editingId = id;
      document.getElementById("edit-name").value    = s.name;
      document.getElementById("edit-sid").value     = s.sid;
      document.getElementById("edit-section").value = s.section || "";
      document.getElementById("edit-math").value    = s.math;
      document.getElementById("edit-eng").value     = s.english;
      document.getElementById("edit-sci").value     = s.science;
      document.getElementById("edit-ict").value     = s.ict;
      document.getElementById("edit-modal").classList.add("open");
    }

    function saveEdit() {
      const name    = document.getElementById("edit-name").value.trim();
      const sid     = document.getElementById("edit-sid").value.trim();
      const section = document.getElementById("edit-section").value.trim();
      const math    = +document.getElementById("edit-math").value;
      const eng     = +document.getElementById("edit-eng").value;
      const sci     = +document.getElementById("edit-sci").value;
      const ict     = +document.getElementById("edit-ict").value;

      if (!name || !sid) { showToast("Name and ID are required.", "error"); return; }
      if ([math,eng,sci,ict].some(g => g < 0 || g > 100)) {
        showToast("Grades must be between 0 and 100.", "error"); return;
      }
      let list = getStudents();
      if (list.find(s => s.sid === sid && s.id !== editingId)) {
        showToast("Student ID already taken.", "error"); return;
      }
      list = list.map(s => s.id === editingId
        ? { ...s, name, sid, section, math, english:eng, science:sci, ict }
        : s
      );
      saveStudents(list);
      closeModal();
      renderTable();
      showToast(`${name} updated successfully.`);
    }

    let deletingId = null;

    function openDeleteModal(id) {
      const s = getStudents().find(x => x.id === id);
      if (!s) return;
      deletingId = id;
      document.getElementById("del-name").textContent = s.name;
      document.getElementById("delete-modal").classList.add("open");
    }

    function confirmDelete() {
      const list = getStudents();
      const s    = list.find(x => x.id === deletingId);
      saveStudents(list.filter(x => x.id !== deletingId));
      closeModal();
      renderTable();
      showToast(`${s?.name || "Student"} removed.`, "error");
    }

    function closeModal() {
      ["edit-modal","delete-modal","view-modal"].forEach(id =>
        document.getElementById(id).classList.remove("open")
      );
      editingId = deletingId = null;
    }

    document.querySelectorAll(".overlay").forEach(o =>
      o.addEventListener("click", e => { if (e.target === o) closeModal(); })
    );

    function renderAnalytics() {
      const list = getStudents();

      const grades = {A:0,B:0,C:0,D:0,F:0};
      list.forEach(s => grades[letterGrade(parseFloat(calcAvg(s)))]++);
      const maxG = Math.max(...Object.values(grades), 1);
      const colors = {A:"var(--green)",B:"var(--accent)",C:"var(--yellow)",D:"#f97316",F:"var(--red)"};
      document.getElementById("grade-dist").innerHTML = Object.entries(grades).map(([g,c]) =>
        `<div class="bar-row">
          <span class="bar-label">Grade ${g}</span>
          <span class="bar-track"><span class="bar-fill" style="width:${(c/maxG*100)}%;background:${colors[g]}"></span></span>
          <span class="bar-count">${c}</span>
        </div>`
      ).join("") || "<p style='color:var(--muted);font-size:0.83rem'>No data yet.</p>";

      const subjects = ["math","english","science","ict"];
      const labels   = ["Math","English","Science","ICT"];
      const subColors= ["var(--accent)","var(--purple)","var(--green)","var(--yellow)"];
      document.getElementById("subject-avgs").innerHTML = list.length === 0
        ? "<p style='color:var(--muted);font-size:0.83rem'>No data yet.</p>"
        : subjects.map((key, i) => {
            const avg = (list.reduce((s,r) => s + +r[key], 0) / list.length).toFixed(1);
            return `<div class="subject-row">
              <span class="subject-name">${labels[i]}</span>
              <span class="subject-avg" style="color:${subColors[i]}">${avg}</span>
            </div>`;
          }).join("");

      const sorted = [...list].sort((a,b) => parseFloat(calcAvg(b)) - parseFloat(calcAvg(a))).slice(0, 5);
      document.getElementById("top-performers").innerHTML = sorted.length === 0
        ? "<p style='color:var(--muted);font-size:0.83rem'>No data yet.</p>"
        : sorted.map((s, i) => {
            const a = calcAvg(s);
            const rankClass = i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "rank-n";
            return `<div class="top-student-row">
              <span class="rank-badge ${rankClass}">${i+1}</span>
              <span style="flex:1;font-weight:500">${esc(s.name)}</span>
              <span class="avg-val" style="${avgColorStyle(parseFloat(a))}">${a}</span>
            </div>`;
          }).join("");

      const pass = list.filter(s => parseFloat(calcAvg(s)) >= 40).length;
      const fail = list.length - pass;
      const total = list.length || 1;
      document.getElementById("pass-fail-chart").innerHTML = list.length === 0
        ? "<p style='color:var(--muted);font-size:0.83rem'>No data yet.</p>"
        : `
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;font-size:0.83rem;margin-bottom:5px">
              <span style="color:var(--green);font-weight:600">Passed</span>
              <span style="font-weight:700">${pass} (${Math.round(pass/total*100)}%)</span>
            </div>
            <div class="bar-track" style="height:12px">
              <div class="bar-fill" style="width:${pass/total*100}%;background:var(--green);height:12px"></div>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.83rem;margin-bottom:5px">
              <span style="color:var(--red);font-weight:600">Failed</span>
              <span style="font-weight:700">${fail} (${Math.round(fail/total*100)}%)</span>
            </div>
            <div class="bar-track" style="height:12px">
              <div class="bar-fill" style="width:${fail/total*100}%;background:var(--red);height:12px"></div>
            </div>
          </div>
          <p style="margin-top:1rem;font-size:0.78rem;color:var(--muted)">Pass mark: 40 or above</p>`;
    }

    function toggleTheme() {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("gt_theme", isDark ? "dark" : "light");
      updateThemeUI(isDark);
    }

    function updateThemeUI(isDark) {
      document.getElementById("theme-btn").textContent = isDark ? "☀️" : "🌙";
      document.getElementById("theme-btn").title = isDark ? "Switch to Light mode" : "Switch to Dark mode";
    }

    (function() {
      const saved = localStorage.getItem("gt_theme");
      if (saved === "dark") {
        document.body.classList.add("dark");
        updateThemeUI(true);
      }
    })();

    renderTable();