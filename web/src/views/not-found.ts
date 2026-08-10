import { navigate } from "../router";
import { icon, TriangleAlert, ArrowLeft } from "../icons";

export function renderNotFoundView() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
    <div class="notfound-wrapper">
      <div class="notfound-content">
        <div class="notfound-code">${icon(TriangleAlert, { size: 16 })} Error 404</div>
        <h1><span class="gradient">404</span></h1>
        <p>This page doesn't exist, or the process you're looking for has already stopped.</p>
        <div class="notfound-actions">
          <button type="button" class="primary" id="go-home">
            ${icon(ArrowLeft, { size: 16 })} Back to console
          </button>
        </div>
      </div>
    </div>
  `;

    document.getElementById("go-home")!.addEventListener("click", () => {
        navigate("/dashboard");
    });
}