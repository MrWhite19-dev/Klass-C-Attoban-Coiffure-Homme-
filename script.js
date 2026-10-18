/* BEXLEY Angré — mini boutique front-end.
   IMPORTANT : remplacez WHATSAPP_NUMBER par le numéro WhatsApp officiel au format international,
   chiffres uniquement (ex. 22507XXXXXXXX). Les prix et articles ci-dessous sont des exemples. */
const WHATSAPP_NUMBER = "2250172254141";
const currency = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const products = [
  {id:1,name:"Derby classique",category:"Chaussures",price:45000,tag:"Élégant",detail:"Cuir · Style habillé",image:"https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=700&q=80"},
  {id:2,name:"Sneakers urbaines",category:"Chaussures",price:38000,tag:"Populaire",detail:"Style quotidien",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"},
  {id:3,name:"Mocassins intemporels",category:"Chaussures",price:42000,tag:"Classique",detail:"Confort & élégance",image:"https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=700&q=85"},
  {id:4,name:"Chemise essentielle",category:"Vêtements",price:25000,tag:"Essentiel",detail:"Coupe soignée",image:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=85"},
  {id:5,name:"Sac de ville",category:"Accessoires",price:32000,tag:"Sélection",detail:"Pratique au quotidien",image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85"},
  {id:6,name:"Chaussures en cuir",category:"Chaussures",price:50000,tag:"Premium",detail:"Finition raffinée",image:"https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=700&q=80"},
  {id:7,name:"Veste décontractée",category:"Vêtements",price:55000,tag:"Nouveau",detail:"Look moderne",image:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=85"},
  {id:8,name:"Ceinture classique",category:"Accessoires",price:15000,tag:"Indispensable",detail:"Détail discret",image:"https://images.unsplash.com/photo-1624222247344-550fb8f8bbc5?auto=format&fit=crop&w=700&q=85"}
];
let cart = loadState("bexley-cart", []);
let favorites = loadState("bexley-favorites", []);
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
function loadState(key, fallback){ try { const parsed=JSON.parse(localStorage.getItem(key)); return Array.isArray(parsed)?parsed:fallback; } catch { return fallback; } }
function saveState(){ localStorage.setItem("bexley-cart",JSON.stringify(cart)); localStorage.setItem("bexley-favorites",JSON.stringify(favorites)); }
function money(value){ return `${currency.format(value)} FCFA`; }
function productById(id){ return products.find(p=>p.id===Number(id)); }
function safeText(value){ return String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function productCard(p){
  const liked=favorites.includes(p.id);
  return `<article class="product-card">
    <div class="product-photo"><img src="${p.image}" alt="${safeText(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=700&q=80'">
      <span class="product-tag">${safeText(p.tag)}</span>
      <button class="favorite-btn ${liked?'is-favorite':''}" data-favorite="${p.id}" aria-label="${liked?'Retirer des favoris':'Ajouter aux favoris'}" title="${liked?'Retirer des favoris':'Ajouter aux favoris'}">${liked?'♥':'♡'}</button>
      <button class="quick-add" data-add="${p.id}">Ajouter au panier ＋</button>
    </div>
    <div class="product-info"><span class="product-category">${safeText(p.category)}</span><h3 class="product-name">${safeText(p.name)}</h3>
      <div class="product-bottom"><span class="product-price">${money(p.price)}</span><span class="product-detail">${safeText(p.detail)}</span></div></div>
  </article>`;
}
function renderProducts(){
  $("#featuredProducts").innerHTML=products.slice(0,4).map(productCard).join("");
  const query=($("#productSearch")?.value||"").trim().toLowerCase();
  const category=$("#categoryFilter")?.value||"Tous";
  const sort=$("#sortFilter")?.value||"featured";
  let shown=products.filter(p=>(p.name+" "+p.category+" "+p.detail).toLowerCase().includes(query)&&(category==="Tous"||p.category===category));
  if(sort==="low") shown.sort((a,b)=>a.price-b.price);
  if(sort==="high") shown.sort((a,b)=>b.price-a.price);
  $("#allProducts").innerHTML=shown.map(productCard).join("")||'<p class="no-results">Aucun article trouvé. Essayez une autre recherche.</p>';
  $("#resultsLine").textContent=`${shown.length} article${shown.length>1?'s':''} affiché${shown.length>1?'s':''}`;
  const favs=products.filter(p=>favorites.includes(p.id));
  $("#favoriteProducts").innerHTML=favs.map(productCard).join("");
  $("#emptyFavorites").classList.toggle("hidden",favs.length>0);
}
function countCart(){ return cart.reduce((n,item)=>n+item.qty,0); }
function totalCart(){ return cart.reduce((n,item)=>{const p=productById(item.id);return n+(p?p.price*item.qty:0)},0); }
function updateCounts(){ $("#cartCount").textContent=countCart(); $("#favCount").textContent=favorites.length; }
function renderCart(){
  const items=cart.filter(item=>productById(item.id));
  $("#cartItems").innerHTML=items.map(item=>{const p=productById(item.id);return `<article class="cart-item"><img src="${p.image}" alt="${safeText(p.name)}"><div><span class="product-category">${safeText(p.category)}</span><h3>${safeText(p.name)}</h3><span class="cart-item-price">${money(p.price)}</span><div class="cart-item-controls"><button class="qty-btn" data-qty="${p.id}" data-delta="-1" aria-label="Diminuer la quantité">−</button><span class="qty-number">${item.qty}</span><button class="qty-btn" data-qty="${p.id}" data-delta="1" aria-label="Augmenter la quantité">+</button><button class="remove-item" data-remove="${p.id}">Supprimer</button></div></div><div><strong>${money(p.price*item.qty)}</strong></div></article>`}).join("");
  $("#emptyCart").classList.toggle("hidden",items.length>0);
  $(".cart-layout").classList.toggle("hidden",items.length===0);
  $("#summaryItems").textContent=countCart();
  $("#summaryTotal").textContent=money(totalCart());
  renderCheckoutPreview();
}
function renderCheckoutPreview(){
  const items=cart.filter(item=>productById(item.id));
  $("#checkoutItems").innerHTML=items.length?items.map(item=>{const p=productById(item.id);return `<div class="checkout-item"><img src="${p.image}" alt=""><div class="checkout-item-info"><strong>${safeText(p.name)}</strong><small>Quantité : ${item.qty}</small></div><span class="checkout-item-price">${money(p.price*item.qty)}</span></div>`}).join(""):'<p class="summary-note">Votre panier est vide. Ajoutez des articles avant de commander.</p>';
  $("#checkoutTotal").textContent=money(totalCart());
}
function renderAll(){renderProducts();renderCart();updateCounts();saveState();}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400);}
function addToCart(id){const found=cart.find(item=>item.id===Number(id));if(found)found.qty++;else cart.push({id:Number(id),qty:1});renderAll();showToast("Article ajouté au panier.");}
function toggleFavorite(id){id=Number(id);if(favorites.includes(id)){favorites=favorites.filter(x=>x!==id);showToast("Article retiré des favoris.");}else{favorites.push(id);showToast("Article ajouté aux favoris.");}renderAll();}
function waUrl(message){return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;}
function openWhatsApp(message){if(!WHATSAPP_NUMBER||WHATSAPP_NUMBER.includes("X")){showToast("Configurez le numéro WhatsApp dans script.js.");return;}window.open(waUrl(message),"_blank","noopener");}
function baseMessage(){return `Bonjour BEXLEY Angré, je souhaite avoir des informations sur vos articles.`;}
function updateWhatsAppLinks(){const url=waUrl(baseMessage());["headerWhatsApp","contactWhatsApp","footerWhatsApp","floatingWhatsApp"].forEach(id=>{const el=document.getElementById(id);if(el)el.href=url;});}
function navigate(){
  const hash=location.hash.replace("#","")||"accueil";
  const valid=["accueil","boutique","favoris","panier","commande","contact"];
  const target=valid.includes(hash)?hash:"accueil";
  $$(".view").forEach(view=>view.classList.toggle("active-view",view.id===target));
  $$(".nav-link").forEach(link=>link.classList.toggle("active",link.getAttribute("href")==="#"+target));
  $("#mainNav").classList.remove("menu-open");$("#menuToggle").setAttribute("aria-expanded","false");
  window.scrollTo({top:0,behavior:"smooth"});
  if(target==="panier")renderCart();if(target==="commande")renderCheckoutPreview();
}
$("#menuToggle").addEventListener("click",()=>{const open=$("#mainNav").classList.toggle("menu-open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return;}
  const fav=event.target.closest("[data-favorite]");if(fav){toggleFavorite(fav.dataset.favorite);return;}
  const qty=event.target.closest("[data-qty]");if(qty){const item=cart.find(x=>x.id===Number(qty.dataset.qty));if(item){item.qty+=Number(qty.dataset.delta);if(item.qty<1)cart=cart.filter(x=>x.id!==item.id);renderAll();}return;}
  const remove=event.target.closest("[data-remove]");if(remove){cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));renderAll();showToast("Article supprimé du panier.");}
});
$("#productSearch").addEventListener("input",renderProducts);
$("#categoryFilter").addEventListener("change",renderProducts);
$("#sortFilter").addEventListener("change",renderProducts);
$("#clearCart").addEventListener("click",()=>{cart=[];renderAll();showToast("Panier vidé.");});
$("#goOrder").addEventListener("click",event=>{if(!cart.length){event.preventDefault();showToast("Ajoutez d'abord un article au panier.");}});
$("#orderForm").addEventListener("submit",event=>{
  event.preventDefault();
  if(!cart.length){showToast("Votre panier est vide.");location.hash="#boutique";return;}
  const name=$("#customerName").value.trim(),phone=$("#customerPhone").value.trim(),delivery=$("#deliveryMode").value,address=$("#customerAddress").value.trim(),notes=$("#customerNotes").value.trim();
  if(!name||!phone||!delivery){showToast("Veuillez remplir les champs obligatoires.");return;}
  const lines=cart.map(item=>{const p=productById(item.id);return p?`• ${p.name} x${item.qty} — ${money(p.price*item.qty)}`:"";}).filter(Boolean).join("\n");
  const message=`Bonjour BEXLEY Angré, je souhaite passer une commande.\n\nCLIENT\nNom : ${name}\nTéléphone : ${phone}\nRéception : ${delivery}\nAdresse/quartier : ${address||"À préciser"}\n\nARTICLES\n${lines}\n\nTOTAL ESTIMATIF : ${money(totalCart())}\n\nPrécisions : ${notes||"Aucune"}\n\nMerci de confirmer la disponibilité, les prix et les frais éventuels.`;
  openWhatsApp(message);
});
window.addEventListener("hashchange",navigate);
$("#year").textContent=new Date().getFullYear();
updateWhatsAppLinks();renderAll();navigate();
