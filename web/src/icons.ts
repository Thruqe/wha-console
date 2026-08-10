import { createElement } from "lucide";
import { LogIn, UserPlus, Eye, EyeOff, Terminal, Mail, Lock, Fingerprint } from "lucide";

export function icon(iconNode: any, options: { size?: number; class?: string } = {}) {
    const svg = createElement(iconNode);
    svg.setAttribute("width", String(options.size ?? 20));
    svg.setAttribute("height", String(options.size ?? 20));
    if (options.class) svg.setAttribute("class", options.class);
    return svg.outerHTML;
}

export { LogIn, UserPlus, Eye, EyeOff, Terminal, Mail, Lock, Fingerprint };