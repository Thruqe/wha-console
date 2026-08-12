import { createElement } from "lucide";
import {
    LogIn, UserPlus, Eye, EyeOff, Terminal, Mail, Lock, Fingerprint,
    TriangleAlert, ArrowLeft, Plus, Play, Square, Trash2, LogOut, Server,
    X, Smartphone, QrCode, Database, Settings, RefreshCw, Info, Activity,
    Download, ArrowDown, WrapText, Code, Radio, Layers, Cpu, ShieldCheck,
    HelpCircle, Zap, CheckCircle2, Globe, FileText, ExternalLink, BookOpen,
    Sliders, Check, Copy, User, MessageSquare, Send, Users, Phone, BarChart2, Key
} from "lucide";

export function icon(iconNode: any, options: { size?: number; class?: string } = {}) {
    const svg = createElement(iconNode);
    svg.setAttribute("width", String(options.size ?? 20));
    svg.setAttribute("height", String(options.size ?? 20));
    if (options.class) svg.setAttribute("class", options.class);
    return svg.outerHTML;
}

export {
    LogIn, UserPlus, Eye, EyeOff, Terminal, Mail, Lock, Fingerprint,
    TriangleAlert, ArrowLeft, Plus, Play, Square, Trash2, LogOut, Server,
    X, Smartphone, QrCode, Database, Settings, RefreshCw, Info, Activity,
    Download, ArrowDown, WrapText, Code, Radio, Layers, Cpu, ShieldCheck,
    HelpCircle, Zap, CheckCircle2, Globe, FileText, ExternalLink, BookOpen,
    Sliders, Check, Copy, User, MessageSquare, Send, Users, Phone, BarChart2, Key
};