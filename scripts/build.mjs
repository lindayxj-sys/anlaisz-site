import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const site = JSON.parse(readFileSync("content/settings/site.json", "utf8"));
const dir = "content/products";
const products = existsSync(dir) ? readdirSync(dir)
  .filter(f => f.endsWith(".md"))
  .map(f => {
    const raw = readFileSync(`${dir}/${f}`, "utf8");
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    const data = {};
    m[1].split("\n").forEach(l => { const i = l.indexOf(":"); if (i > 0) data[l.slice(0,i).trim()] = l.slice(i+1).trim(); });
    return data;
  })
  .sort((a, b) => (a.order||99) - (b.order||99)) : [];

const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const cards = products.map(p => `<a class="product-card" href="#contact"><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></a>`).join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(site.company_name)} | ${esc(site.tagline)}</title>
<meta name="description" content="${esc(site.hero_subtitle)}">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#222;line-height:1.6}
.container{max-width:1100px;margin:0 auto;padding:0 24px}
header{background:#fff;border-bottom:1px solid #eaeaea;position:sticky;top:0;z-index:100}
.header-inner{display:flex;justify-content:space-between;align-items:center;height:64px}
.logo{font-size:20px;font-weight:700}
.logo span{color:#b8860b}
nav a{margin-left:28px;text-decoration:none;color:#444;font-size:15px}
nav a:hover{color:#b8860b}
.hero{background:linear-gradient(135deg,#1a1a1a,#2d2d2d);color:#fff;padding:100px 0;text-align:center}
.hero h1{font-size:42px;margin-bottom:16px;line-height:1.2}
.hero p{font-size:18px;color:#ccc;max-width:640px;margin:0 auto 32px}
.btn{display:inline-block;background:#b8860b;color:#fff;padding:14px 36px;border-radius:4px;text-decoration:none;font-weight:600}
section{padding:80px 0}
.section-title{text-align:center;font-size:28px;margin-bottom:12px}
.section-subtitle{text-align:center;color:#777;margin-bottom:48px}
.product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px}
.product-card{border:1px solid #eaeaea;border-radius:8px;padding:28px 20px;text-align:center;text-decoration:none;color:inherit}
.product-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.08)}
.product-card h3{font-size:18px;margin-bottom:8px}
.product-card p{color:#777;font-size:14px}
.about{background:#f9f9f9}
.about-content{max-width:760px;margin:0 auto;text-align:center;color:#555}
.contact-form{max-width:560px;margin:0 auto}
.contact-form label{display:block;font-size:14px;font-weight:600;margin:20px 0 6px}
.contact-form input,.contact-form textarea{width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:4px;font-size:15px;font-family:inherit}
.contact-form textarea{min-height:120px;resize:vertical}
.contact-form button{margin-top:24px;width:100%;padding:14px;background:#b8860b;color:#fff;border:none;border-radius:4px;font-size:16px;font-weight:600;cursor:pointer}
footer{background:#1a1a1a;color:#888;text-align:center;padding:32px 0;font-size:14px}
.form-status{text-align:center;margin-top:14px}
.form-status.ok{color:#1a7f37}.form-status.err{color:#c0392b}
@media(max-width:600px){.hero h1{font-size:28px}.hero{padding:64px 0}}
</style>
</head>
<body>
<header><div class="container header-inner"><div class="logo">${esc(site.brand)}<span>${esc(site.brand_highlight)}</span></div>
<nav><a href="#products">Products</a><a href="#about">About</a><a href="#contact">Contact</a></nav></div></header>
<section class="hero"><div class="container"><h1>${esc(site.tagline)}</h1><p>${esc(site.hero_subtitle)}</p><a href="#contact" class="btn">${esc(site.hero_button_text)}</a></div></section>
<section id="products"><div class="container"><h2 class="section-title">Our Products</h2><p class="section-subtitle">${esc(site.products_subtitle)}</p><div class="product-grid">${cards}</div></div></section>
<section id="about" class="about"><div class="container"><h2 class="section-title">About Us</h2><p class="about-content">${esc(site.about_text)}</p></div></section>
<section id="contact"><div class="container"><h2 class="section-title">Get in Touch</h2><p class="section-subtitle">${esc(site.contact_subtitle)}</p>
<form class="contact-form" id="inquiryForm">
<label for="name">Name</label><input type="text" id="name" name="name" required>
<label for="email">Email</label><input type="email" id="email" name="email" required>
<label for="message">Message</label><textarea id="message" name="message" required></textarea>
<button type="submit">Send Inquiry</button><p class="form-status" id="formStatus"></p></form></div></section>
<script>
document.addEventListener("DOMContentLoaded",function(){var f=document.getElementById("inquiryForm");if(!f)return;var s=document.getElementById("formStatus");f.addEventListener("submit",async function(e){e.preventDefault();var d=Object.fromEntries(new FormData(f).entries());try{var r=await fetch("/api/inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});var o=await r.json();if(r.ok&&o.ok){s.textContent="Thank you! We will reply within 24 hours.";s.className="form-status ok";f.reset();}else{throw 0;}}catch(err){s.textContent="Sorry, something went wrong. Please email us directly.";s.className="form-status err";}});});
</script>
<footer><div class="container">&copy; ${new Date().getFullYear()} ${esc(site.company_name)}. ${esc(site.footer_text)}</div></footer>
</body>
</html>`;

writeFileSync("index.html", html);
console.log(`Built index.html with ${products.length} products`);
